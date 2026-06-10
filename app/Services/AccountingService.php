<?php

namespace App\Services;

use App\Models\Journal;
use App\Models\JournalEntry;
use App\Models\AccountBalance;
use Illuminate\Support\Facades\DB;
use App\Exceptions\UnbalancedJournalException;

class AccountingService
{
    public function post(array $data, int $createdBy): Journal
    {
        $totalDebit  = collect($data['entries'])->sum('debit');
        $totalCredit = collect($data['entries'])->sum('credit');

        if (round($totalDebit, 4) !== round($totalCredit, 4)) {
            throw new UnbalancedJournalException($totalDebit, $totalCredit);
        }

        return DB::transaction(function () use ($data, $createdBy, $totalDebit) {
            $journal = Journal::create([
                'station_id'     => $data['station_id'],
                'journal_number' => $this->nextNumber($data['station_id'], $data['type']),
                'type'           => $data['type'],
                'date'           => $data['date'],
                'narration'      => $data['narration'],
                'reference_type' => $data['reference_type'] ?? null,
                'reference_id'   => $data['reference_id'] ?? null,
                'total_debit'    => $totalDebit,
                'total_credit'   => $totalDebit,
                'is_posted'      => true,
                'created_by'     => $createdBy,
                'posted_by'      => $createdBy,
                'posted_at'      => now(),
            ]);

            foreach ($data['entries'] as $entry) {
                JournalEntry::create([
                    'journal_id'  => $journal->id,
                    'account_id'  => $entry['account_id'],
                    'debit'       => $entry['debit'] ?? 0,
                    'credit'      => $entry['credit'] ?? 0,
                    'description' => $entry['description'] ?? null,
                ]);
                $this->updateBalance($entry['account_id'], $entry['debit'] ?? 0, $entry['credit'] ?? 0);
            }

            return $journal;
        });
    }

    public function reverse(Journal $journal, int $reversedBy): Journal
    {
        $reversalEntries = $journal->entries->map(fn($e) => [
            'account_id'  => $e->account_id,
            'debit'       => $e->credit,   // swap
            'credit'      => $e->debit,    // swap
            'description' => "Reversal: {$e->description}",
        ])->toArray();

        $reversal = $this->post([
            'station_id'  => $journal->station_id,
            'type'        => $journal->type,
            'date'        => now()->toDateString(),
            'narration'   => "Reversal of JV#{$journal->journal_number}: {$journal->narration}",
            'entries'     => $reversalEntries,
        ], $reversedBy);

        $journal->update(['is_reversed' => true, 'reversed_by' => $reversal->id]);

        return $reversal;
    }

    private function nextNumber(int $stationId, string $type): string
    {
        $prefix = match($type) {
            'sales'    => 'SJ',
            'purchase' => 'PJ',
            'cash'     => 'CV',
            'bank'     => 'BV',
            'salary'   => 'SA',
            default    => 'JV',
        };
        $year  = now()->year;
        $count = Journal::where('station_id', $stationId)
                        ->where('type', $type)
                        ->whereYear('created_at', $year)
                        ->count() + 1;
        return "{$prefix}-{$year}-" . str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    private function updateBalance(int $accountId, float $debit, float $credit): void
    {
        $coa = DB::table('chart_of_accounts')->where('id', $accountId)->first();
        if (!$coa) return;

        $balance = AccountBalance::firstOrCreate(
            ['account_id' => $accountId],
            ['debit_total' => 0, 'credit_total' => 0, 'balance' => 0]
        );

        $newDebitTotal = (float) $balance->debit_total + $debit;
        $newCreditTotal = (float) $balance->credit_total + $credit;

        if ($coa->normal_balance === 'debit') {
            $newBalance = $newDebitTotal - $newCreditTotal;
        } else {
            $newBalance = $newCreditTotal - $newDebitTotal;
        }

        $balance->update([
            'debit_total' => $newDebitTotal,
            'credit_total' => $newCreditTotal,
            'balance' => $newBalance,
        ]);
    }
}
