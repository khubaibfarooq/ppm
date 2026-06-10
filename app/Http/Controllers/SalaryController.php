<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SalaryPayment;
use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalaryController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $employees = User::where('station_id', $stationId)
            ->where('status', 'active')
            ->get();

        $payments = SalaryPayment::with('user')
            ->where('station_id', $stationId)
            ->orderByDesc('payment_date')
            ->paginate(15);

        return Inertia::render('Salaries/Index', [
            'employees' => $employees,
            'payments' => $payments,
        ]);
    }

    public function process(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'payment_date' => 'required|date',
            'bonus' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,bank',
        ]);

        $employee = User::findOrFail($validated['user_id']);
        
        $basicSalary = $employee->basic_salary;
        $bonus = $validated['bonus'] ?? 0;
        $deductions = $validated['deductions'] ?? 0;
        $netAmount = round($basicSalary + $bonus - $deductions, 2);

        if ($employee->station_id !== $stationId) {
            abort(403);
        }

        return DB::transaction(function () use ($validated, $employee, $basicSalary, $bonus, $deductions, $netAmount, $stationId) {
            // Post journal: DR Salaries Expense / CR Cash/Bank
            $expenseAccount = ChartOfAccount::where('station_id', $stationId)->whereIn('code', ['1302010003', '5200'])->first();
            $cashAccountId = $validated['payment_method'] === 'cash'
                ? (setting('cash_account_id', $stationId) ?? 2)
                : (setting('bank_account_id', $stationId) ?? 3);

            if (!$expenseAccount) {
                return redirect()->back()->with('error', 'Salaries Expense account is not configured.');
            }

            $journalEntries = [
                [
                    'account_id' => $expenseAccount->id,
                    'debit' => $netAmount,
                    'credit' => 0,
                    'description' => "Salary Expense for {$employee->name} - {$validated['payment_date']}",
                ],
                [
                    'account_id' => $cashAccountId,
                    'debit' => 0,
                    'credit' => $netAmount,
                    'description' => "Paid salary to {$employee->name} - {$validated['payment_method']}",
                ]
            ];

            $journal = $this->accounting->post([
                'station_id' => $stationId,
                'type' => 'salary',
                'date' => $validated['payment_date'],
                'narration' => "Salary processed: {$employee->name} (Basic: {$basicSalary}, Bonus: {$bonus}, Deductions: {$deductions})",
                'reference_type' => SalaryPayment::class,
                'reference_id' => null, // will fill below
                'entries' => $journalEntries,
            ], auth()->id());

            // Create Salary Payment
            $payment = SalaryPayment::create([
                'station_id' => $stationId,
                'user_id' => $employee->id,
                'payment_date' => $validated['payment_date'],
                'basic_salary' => $basicSalary,
                'bonus' => $bonus,
                'deductions' => $deductions,
                'net_amount' => $netAmount,
                'payment_method' => $validated['payment_method'],
                'journal_id' => $journal->id,
                'processed_by' => auth()->id(),
            ]);

            $journal->update([
                'reference_id' => $payment->id,
            ]);

            return redirect()->back()->with('success', 'Salary processed and journal posted successfully.');
        });
    }
}
