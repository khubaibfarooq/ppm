<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function index(Request $request): Response
    {
        $stationId = auth()->user()->station_id;

        $accounts = ChartOfAccount::where('station_id', $stationId)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/LedgerIndex', [
            'accounts' => $accounts,
        ]);
    }

    public function show(ChartOfAccount $account, Request $request): Response
    {
        $stationId = auth()->user()->station_id;

        if ($account->station_id !== $stationId) {
            abort(403);
        }

        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());

        // Opening Balance calculation: sum of all debits/credits before $from date
        $debitsBefore = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
            ->where('journal_entries.account_id', $account->id)
            ->where('journals.is_posted', true)
            ->where('journals.date', '<', $from)
            ->sum('debit');

        $creditsBefore = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
            ->where('journal_entries.account_id', $account->id)
            ->where('journals.is_posted', true)
            ->where('journals.date', '<', $from)
            ->sum('credit');

        $openingBalance = $account->normal_balance === 'debit'
            ? $debitsBefore - $creditsBefore
            : $creditsBefore - $debitsBefore;

        // Ledger entries inside date range
        $entries = JournalEntry::with('journal')
            ->join('journals', 'journals.id', '=', 'journal_entries.journal_id')
            ->where('journal_entries.account_id', $account->id)
            ->where('journals.is_posted', true)
            ->whereBetween('journals.date', [$from, $to])
            ->orderBy('journals.date')
            ->orderBy('journal_entries.created_at')
            ->select('journal_entries.*')
            ->get();

        // Calculate running balance
        $runningBalance = $openingBalance;
        $ledgerEntries = $entries->map(function ($e) use (&$runningBalance, $account) {
            if ($account->normal_balance === 'debit') {
                $runningBalance += ($e->debit - $e->credit);
            } else {
                $runningBalance += ($e->credit - $e->debit);
            }
            return [
                'id' => $e->id,
                'journal_number' => $e->journal->journal_number,
                'journal_id' => $e->journal->id,
                'date' => $e->journal->date->format('Y-m-d'),
                'narration' => $e->journal->narration,
                'description' => $e->description,
                'debit' => (double)$e->debit,
                'credit' => (double)$e->credit,
                'balance' => $runningBalance,
            ];
        });

        return Inertia::render('Accounting/LedgerShow', [
            'account' => $account,
            'from' => $from,
            'to' => $to,
            'openingBalance' => $openingBalance,
            'ledgerEntries' => $ledgerEntries,
            'closingBalance' => $runningBalance,
        ]);
    }
}
