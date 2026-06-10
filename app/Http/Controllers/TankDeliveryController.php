<?php

namespace App\Http\Controllers;

use App\Models\TankDelivery;
use App\Models\Tank;
use App\Models\Supplier;
use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TankDeliveryController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'tank_id' => 'required|exists:tanks,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'delivery_date' => 'required|date',
            'liters_received' => 'required|numeric|min:0',
            'cost_per_liter' => 'required|numeric|min:0',
        ]);

        $validated['station_id'] = $stationId;
        $validated['recorded_by'] = auth()->id();
        $validated['total_amount'] = round($validated['liters_received'] * $validated['cost_per_liter'], 2);

        return DB::transaction(function () use ($validated, $stationId) {
            $tank = Tank::with('product')->findOrFail($validated['tank_id']);
            $supplier = Supplier::findOrFail($validated['supplier_id']);
            
            // 1. Post Purchase Journal Entry
            // DR Inventory (Fuel Asset) / CR Accounts Payable
            $inventoryAccountId = $tank->product->inventory_account_id;
            $apAccount = ChartOfAccount::where('station_id', $stationId)->whereIn('code', ['100501', '2100'])->first();

            if (!$inventoryAccountId || !$apAccount) {
                return redirect()->back()->with('error', 'Inventory account or Accounts Payable control account is not configured.');
            }

            $journalEntries = [
                [
                    'account_id' => $inventoryAccountId,
                    'debit' => $validated['total_amount'],
                    'credit' => 0,
                    'description' => "Received {$validated['liters_received']}L of {$tank->product->name}",
                ],
                [
                    'account_id' => $apAccount->id,
                    'debit' => 0,
                    'credit' => $validated['total_amount'],
                    'description' => "Payable to {$supplier->name} for {$tank->product->name} delivery",
                ]
            ];

            $journal = $this->accounting->post([
                'station_id' => $stationId,
                'type' => 'purchase',
                'date' => $validated['delivery_date'],
                'narration' => "Fuel delivery: {$tank->name} - {$validated['liters_received']}L from {$supplier->name}",
                'reference_type' => TankDelivery::class,
                'reference_id' => null, // will fill below
                'entries' => $journalEntries,
            ], auth()->id());

            // 2. Create TankDelivery
            $validated['journal_id'] = $journal->id;
            $delivery = TankDelivery::create($validated);

            // Update polymorphic reference on journal
            $journal->update([
                'reference_id' => $delivery->id,
            ]);

            // 3. Update physical tank stock levels
            $tank->increment('current_liters', $validated['liters_received']);

            // 4. Update supplier credit balance
            $supplier->increment('balance', $validated['total_amount']);

            return redirect()->back()->with('success', 'Fuel delivery recorded and purchase journal posted successfully.');
        });
    }
}
