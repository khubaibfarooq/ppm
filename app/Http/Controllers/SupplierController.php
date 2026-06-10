<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $suppliers = Supplier::where('station_id', $stationId)->get();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
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

        Supplier::create($validated);

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }

    public function makePayment(Request $request, Supplier $supplier): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank',
            'notes' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $supplier, $stationId) {
            // DR Accounts Payable / CR Cash/Bank
            $cashAccountId = $validated['payment_method'] === 'cash'
                ? (setting('cash_account_id', $stationId) ?? 2)
                : (setting('bank_account_id', $stationId) ?? 3);

            $apAccount = ChartOfAccount::where('station_id', $stationId)->whereIn('code', ['100501', '2100'])->first();

            if (!$apAccount) {
                return redirect()->back()->with('error', 'Accounts Payable control account is not configured.');
            }

            $journalEntries = [
                [
                    'account_id' => $apAccount->id,
                    'debit' => $validated['amount'],
                    'credit' => 0,
                    'description' => "Debit to Accounts Payable for supplier {$supplier->name}",
                ],
                [
                    'account_id' => $cashAccountId,
                    'debit' => 0,
                    'credit' => $validated['amount'],
                    'description' => "Paid supplier {$supplier->name} - {$validated['payment_method']}",
                ]
            ];

            $this->accounting->post([
                'station_id' => $stationId,
                'type' => 'cash',
                'date' => $validated['payment_date'],
                'narration' => "Supplier payment made: {$supplier->name} - PKR " . number_format($validated['amount']) . " via {$validated['payment_method']}." . ($validated['notes'] ? " ({$validated['notes']})" : ""),
                'reference_type' => Supplier::class,
                'reference_id' => $supplier->id,
                'entries' => $journalEntries,
            ], auth()->id());

            // Reduce supplier AP balance
            $supplier->decrement('balance', $validated['amount']);

            return redirect()->back()->with('success', 'Supplier payment made and journal posted successfully.');
        });
    }
}
