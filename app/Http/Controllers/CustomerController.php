<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $customers = Customer::where('station_id', $stationId)->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $validated['station_id'] = $stationId;

        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return redirect()->back()->with('success', 'Customer deleted successfully.');
    }

    public function receivePayment(Request $request, Customer $customer): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank',
            'notes' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $customer, $stationId) {
            // DR Cash/Bank / CR Accounts Receivable
            $cashAccountId = $validated['payment_method'] === 'cash'
                ? (setting('cash_account_id', $stationId) ?? 2)
                : (setting('bank_account_id', $stationId) ?? 3); // default bank account

            $arAccount = ChartOfAccount::where('station_id', $stationId)->whereIn('code', ['110501', '1300'])->first();

            if (!$arAccount) {
                return redirect()->back()->with('error', 'Accounts Receivable control account is not configured.');
            }

            $journalEntries = [
                [
                    'account_id' => $cashAccountId,
                    'debit' => $validated['amount'],
                    'credit' => 0,
                    'description' => "Received payment from customer {$customer->name} - {$validated['payment_method']}",
                ],
                [
                    'account_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $validated['amount'],
                    'description' => "Credit to Accounts Receivable for customer {$customer->name}",
                ]
            ];

            $this->accounting->post([
                'station_id' => $stationId,
                'type' => 'cash',
                'date' => $validated['payment_date'],
                'narration' => "Customer payment received: {$customer->name} - PKR " . number_format($validated['amount']) . " via {$validated['payment_method']}." . ($validated['notes'] ? " ({$validated['notes']})" : ""),
                'reference_type' => Customer::class,
                'reference_id' => $customer->id,
                'entries' => $journalEntries,
            ], auth()->id());

            // Reduce customer AR balance
            $customer->decrement('balance', $validated['amount']);

            return redirect()->back()->with('success', 'Customer payment received and journal posted successfully.');
        });
    }
}
