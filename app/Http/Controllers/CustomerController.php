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

        $customers = Customer::where('station_id', $stationId)->with('vehicles')->get();

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
            'vehicle_id' => 'nullable|exists:vehicles,id',
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

            $vehicleInfo = '';
            if (!empty($validated['vehicle_id'])) {
                $vehicle = \App\Models\Vehicle::findOrFail($validated['vehicle_id']);
                $vehicleInfo = " (Vehicle: {$vehicle->vehicle_number})";
            }

            $journalEntries = [
                [
                    'account_id' => $cashAccountId,
                    'debit' => $validated['amount'],
                    'credit' => 0,
                    'description' => "Received payment from customer {$customer->name}{$vehicleInfo} - {$validated['payment_method']}",
                ],
                [
                    'account_id' => $arAccount->id,
                    'debit' => 0,
                    'credit' => $validated['amount'],
                    'description' => "Credit to Accounts Receivable for customer {$customer->name}{$vehicleInfo}",
                ]
            ];

            $this->accounting->post([
                'station_id' => $stationId,
                'type' => 'cash',
                'date' => $validated['payment_date'],
                'narration' => "Customer payment received: {$customer->name}{$vehicleInfo} - PKR " . number_format($validated['amount']) . " via {$validated['payment_method']}." . ($validated['notes'] ? " ({$validated['notes']})" : ""),
                'reference_type' => Customer::class,
                'reference_id' => $customer->id,
                'entries' => $journalEntries,
            ], auth()->id());

            // Process balance decrements
            if (!empty($validated['vehicle_id'])) {
                $vehicle = \App\Models\Vehicle::findOrFail($validated['vehicle_id']);
                $vehicle->decrement('balance', $validated['amount']);
            } else {
                // Auto distribute general payment across vehicles with positive balances
                $remainingAmount = $validated['amount'];
                $vehicles = $customer->vehicles()->where('balance', '>', 0)->orderBy('id')->get();
                foreach ($vehicles as $v) {
                    if ($remainingAmount <= 0) {
                        break;
                    }
                    $reduction = min($remainingAmount, $v->balance);
                    $v->decrement('balance', $reduction);
                    $remainingAmount -= $reduction;
                }
            }

            // Reduce customer AR balance
            $customer->decrement('balance', $validated['amount']);

            return redirect()->back()->with('success', 'Customer payment received and journal posted successfully.');
        });
    }

    public function addVehicle(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_number' => 'required|string|max:50',
        ]);

        // Check if vehicle already exists for this customer
        $exists = $customer->vehicles()->where('vehicle_number', $validated['vehicle_number'])->exists();
        if ($exists) {
            return redirect()->back()->with('error', 'Vehicle is already registered for this customer.');
        }

        $customer->vehicles()->create([
            'vehicle_number' => $validated['vehicle_number'],
            'balance' => 0,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Vehicle registered successfully.');
    }

    public function deleteVehicle(\App\Models\Vehicle $vehicle): RedirectResponse
    {
        // Don't allow deletion if vehicle has a balance
        if ($vehicle->balance > 0) {
            return redirect()->back()->with('error', 'Cannot delete vehicle with outstanding balance.');
        }

        $vehicle->delete();
        return redirect()->back()->with('success', 'Vehicle removed successfully.');
    }
}
