<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function trialBalance(Request $request): Response
    {
        $stationId = auth()->user()->station_id;
        $date = $request->get('date', today()->toDateString());

        $accounts = ChartOfAccount::where('station_id', $stationId)
            ->where('is_active', true)
            ->get()
            ->map(function ($a) use ($date) {
                $debits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
                    ->where('journal_entries.account_id', $a->id)
                    ->where('journals.is_posted', true)
                    ->where('journals.date', '<=', $date)
                    ->sum('debit');

                $credits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
                    ->where('journal_entries.account_id', $a->id)
                    ->where('journals.is_posted', true)
                    ->where('journals.date', '<=', $date)
                    ->sum('credit');

                $balance = $a->normal_balance === 'debit'
                    ? $debits - $credits
                    : $credits - $debits;

                return [
                    'code'         => $a->code,
                    'name'         => $a->name,
                    'type'         => $a->type,
                    'debit_total'  => (double)$debits,
                    'credit_total' => (double)$credits,
                    'balance'      => (double)$balance,
                ];
            });

        return Inertia::render('Reports/TrialBalance', [
            'accounts'     => $accounts,
            'totalDebit'   => $accounts->sum('debit_total'),
            'totalCredit'  => $accounts->sum('credit_total'),
            'asOf'         => $date,
        ]);
    }

    public function profitLoss(Request $request): Response
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        $revenue = $this->getAccountBalancesByTypeRange('revenue', $from, $to);
        $expenses = $this->getAccountBalancesByTypeRange('expense', $from, $to);

        $totalRevenue = $revenue->sum('balance');
        $totalExpenses = $expenses->sum('balance');

        return Inertia::render('Reports/ProfitLoss', [
            'from'        => $from,
            'to'          => $to,
            'revenue'     => $revenue->toArray(),
            'expenses'    => $expenses->toArray(),
            'totalRevenue' => $totalRevenue,
            'totalExpenses' => $totalExpenses,
            'netProfit'   => $totalRevenue - $totalExpenses,
        ]);
    }

    public function balanceSheet(Request $request): Response
    {
        $asOf = $request->get('date', today()->toDateString());

        $assets = $this->getAccountBalancesByType('asset', $asOf);
        $liabilities = $this->getAccountBalancesByType('liability', $asOf);
        $equity = $this->getAccountBalancesByType('equity', $asOf);

        // Add net profit/loss up to asOf date to Retained Earnings
        $totalRevenue = ChartOfAccount::where('station_id', auth()->user()->station_id)
            ->where('type', 'revenue')
            ->get()
            ->sum(fn($a) => $this->getAccountBalanceSum($a->id, $asOf, $a->normal_balance));

        $totalExpense = ChartOfAccount::where('station_id', auth()->user()->station_id)
            ->where('type', 'expense')
            ->get()
            ->sum(fn($a) => $this->getAccountBalanceSum($a->id, $asOf, $a->normal_balance));

        $netProfit = $totalRevenue - $totalExpense;

        $totalAssets = $assets->sum('balance');
        $totalLiabilities = $liabilities->sum('balance');
        $totalEquity = $equity->sum('balance') + $netProfit;

        return Inertia::render('Reports/BalanceSheet', [
            'date' => $asOf,
            'assets' => $assets->toArray(),
            'liabilities' => $liabilities->toArray(),
            'equity' => $equity->toArray(),
            'netProfit' => $netProfit,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'totalEquity' => $totalEquity,
        ]);
    }

    private function getAccountBalancesByType(string $type, string $asOfDate)
    {
        $stationId = auth()->user()->station_id;

        return ChartOfAccount::where('station_id', $stationId)
            ->where('type', $type)
            ->where('is_active', true)
            ->get()
            ->map(function ($a) use ($asOfDate) {
                $balance = $this->getAccountBalanceSum($a->id, $asOfDate, $a->normal_balance);
                return [
                    'code' => $a->code,
                    'name' => $a->name,
                    'balance' => (double)$balance,
                ];
            })->filter(fn($item) => $item['balance'] != 0.00)->values();
    }

    private function getAccountBalancesByTypeRange(string $type, string $from, string $to)
    {
        $stationId = auth()->user()->station_id;

        return ChartOfAccount::where('station_id', $stationId)
            ->where('type', $type)
            ->where('is_active', true)
            ->get()
            ->map(function ($a) use ($from, $to) {
                $debits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
                    ->where('journal_entries.account_id', $a->id)
                    ->where('journals.is_posted', true)
                    ->whereBetween('journals.date', [$from, $to])
                    ->sum('debit');

                $credits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
                    ->where('journal_entries.account_id', $a->id)
                    ->where('journals.is_posted', true)
                    ->whereBetween('journals.date', [$from, $to])
                    ->sum('credit');

                $balance = $a->normal_balance === 'debit'
                    ? $debits - $credits
                    : $credits - $debits;

                return [
                    'code' => $a->code,
                    'name' => $a->name,
                    'balance' => (double)$balance,
                ];
            })->filter(fn($item) => $item['balance'] != 0.00)->values();
    }

    private function getAccountBalanceSum(int $accountId, string $date, string $normalBalance): float
    {
        $debits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
            ->where('journal_entries.account_id', $accountId)
            ->where('journals.is_posted', true)
            ->where('journals.date', '<=', $date)
            ->sum('debit');

        $credits = JournalEntry::join('journals', 'journals.id', '=', 'journal_entries.journal_id')
            ->where('journal_entries.account_id', $accountId)
            ->where('journals.is_posted', true)
            ->where('journals.date', '<=', $date)
            ->sum('credit');

        return $normalBalance === 'debit' ? (float)($debits - $credits) : (float)($credits - $debits);
    }
}
