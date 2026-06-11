<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\ShiftLog;
use App\Models\Nozzle;
use App\Models\Tank;
use App\Models\MeterReading;
use App\Models\TankDipReading;
use App\Models\CashCollection;
use App\Services\ShiftOpeningService;
use App\Services\ShiftClosingService;
use App\Services\StockReconciliationService;
use App\Services\DipChartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftLogController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id ?? \App\Models\Station::first()?->id;

        $shiftLogs = ShiftLog::with(['shift', 'openedBy', 'closedBy'])
            ->where('station_id', $stationId)
            ->orderByDesc('date')
            ->paginate(20);

        $shifts = Shift::where('station_id', $stationId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Shifts/Index', [
            'shiftLogs' => $shiftLogs,
            'shifts'    => $shifts,
        ]);
    }

    public function show(ShiftLog $shiftLog): Response
    {
        $shiftLog->load([
            'shift', 
            'openedBy', 
            'closedBy',
            'sales.nozzle.product', 
            'sales.nozzle.machine',
            'dipReadings.tank.product',
            'cashCollections.user',
            'journal.entries.account',
        ]);

        $reconciliation = app(StockReconciliationService::class)->reconcile($shiftLog);

        return Inertia::render('Shifts/Show', [
            'shiftLog'       => $shiftLog,
            'reconciliation' => $reconciliation,
        ]);
    }

    public function create(): Response
    {
        $stationId = auth()->user()->station_id ?? \App\Models\Station::first()?->id;

        $shifts = Shift::where('station_id', $stationId)->where('is_active', true)->get();
        
        $nozzles = Nozzle::with(['product', 'machine'])
            ->where('station_id', $stationId)
            ->active()
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'label' => $n->label,
                'machine_name' => $n->machine->name,
                'product_name' => $n->product->name,
                // Get the last meter reading for this nozzle
                'last_reading' => (double) (MeterReading::where('nozzle_id', $n->id)->latest()->value('reading_value') ?? 0),
            ]);

        $tanks = Tank::with('product')
            ->where('station_id', $stationId)
            ->where('is_active', true)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'product_name' => $t->product->name,
                'last_dip' => (int) (TankDipReading::where('tank_id', $t->id)->latest()->value('dip_mm') ?? 0),
            ]);

        return Inertia::render('Shifts/Create', [
            'shifts' => $shifts,
            'nozzles' => $nozzles,
            'tanks' => $tanks,
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shift_id' => 'required|exists:shifts,id',
            'date' => 'required|date',
            'meter_readings' => 'required|array',
            'meter_readings.*.nozzle_id' => 'required|exists:nozzles,id',
            'meter_readings.*.reading_value' => 'required|numeric|min:0',
            'dip_readings' => 'required|array',
            'dip_readings.*.tank_id' => 'required|exists:tanks,id',
            'dip_readings.*.dip_mm' => 'required|integer|min:0',
            'dip_readings.*.water_dip_mm' => 'nullable|integer|min:0',
        ]);

        $shiftLog = app(ShiftOpeningService::class)->open($validated, auth()->id());

        return redirect()->route('shift-logs.show', $shiftLog->id)
            ->with('success', 'Shift opened successfully.');
    }

    public function closeForm(ShiftLog $shiftLog): Response
    {
        $stationId = auth()->user()->station_id ?? \App\Models\Station::first()?->id;

        $nozzles = Nozzle::with(['product', 'machine'])
            ->where('station_id', $stationId)
            ->active()
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'label' => $n->label,
                'machine' => ['name' => $n->machine->name],
                'product' => ['name' => $n->product->name],
                'last_reading' => (double) (MeterReading::where('nozzle_id', $n->id)
                    ->where('shift_log_id', $shiftLog->id)
                    ->where('reading_type', 'opening')
                    ->value('reading_value') ?? 0),
            ]);

        $tanks = Tank::with('product')
            ->where('station_id', $stationId)
            ->where('is_active', true)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'product' => ['name' => $t->product->name],
                'opening_dip' => (int) (TankDipReading::where('tank_id', $t->id)
                    ->where('shift_log_id', $shiftLog->id)
                    ->where('reading_type', 'opening')
                    ->value('dip_mm') ?? 0),
            ]);

        $suppliers = \App\Models\Supplier::where('station_id', $stationId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Shifts/Close', [
            'shiftLog' => $shiftLog,
            'nozzles' => $nozzles,
            'tanks' => $tanks,
            'suppliers' => $suppliers,
        ]);
    }

    public function close(Request $request, ShiftLog $shiftLog): RedirectResponse
    {
        $request->validate([
            'meter_readings' => 'required|array',
            'meter_readings.*.nozzle_id' => 'required|exists:nozzles,id',
            'meter_readings.*.opening' => 'required|numeric|min:0',
            'meter_readings.*.closing' => 'required|numeric|min:0',
            'dip_readings' => 'required|array',
            'dip_readings.*.tank_id' => 'required|exists:tanks,id',
            'dip_readings.*.opening_dip' => 'required|integer|min:0',
            'dip_readings.*.dip_mm' => 'required|integer|min:0',
            'dip_readings.*.water_mm' => 'nullable|integer|min:0',
            'supplies' => 'nullable|array',
            'supplies.*.tank_id' => 'required|exists:tanks,id',
            'supplies.*.supplier_id' => 'required|exists:suppliers,id',
            'supplies.*.liters_received' => 'required|numeric|min:0',
            'supplies.*.cost_per_liter' => 'required|numeric|min:0',
            'cash_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $shiftLog) {
            $userId = auth()->id();
            $stationId = auth()->user()->station_id;

            // 1. Save/update nozzle readings (opening and closing)
            foreach ($request->input('meter_readings') as $mr) {
                // Save opening reading
                MeterReading::updateOrCreate(
                    [
                        'nozzle_id' => $mr['nozzle_id'],
                        'shift_log_id' => $shiftLog->id,
                        'reading_type' => 'opening',
                    ],
                    [
                        'reading_value' => $mr['opening'],
                        'recorded_at' => now(),
                    ]
                );

                // Save closing reading
                MeterReading::updateOrCreate(
                    [
                        'nozzle_id' => $mr['nozzle_id'],
                        'shift_log_id' => $shiftLog->id,
                        'reading_type' => 'closing',
                    ],
                    [
                        'reading_value' => $mr['closing'],
                        'recorded_at' => now(),
                    ]
                );
            }

            // 2. Save/update dip readings (opening and closing)
            foreach ($request->input('dip_readings') as $dr) {
                $tank = Tank::findOrFail($dr['tank_id']);
                
                // Opening
                $openingLiters = app(DipChartService::class)->dipToLiters($tank, $dr['opening_dip']);
                TankDipReading::updateOrCreate(
                    [
                        'tank_id' => $dr['tank_id'],
                        'shift_log_id' => $shiftLog->id,
                        'reading_type' => 'opening',
                    ],
                    [
                        'dip_mm' => $dr['opening_dip'],
                        'liters_from_chart' => $openingLiters,
                        'water_dip_mm' => 0,
                        'recorded_at' => now(),
                    ]
                );

                // Closing
                $closingLiters = app(DipChartService::class)->dipToLiters($tank, $dr['dip_mm']);
                TankDipReading::updateOrCreate(
                    [
                        'tank_id' => $dr['tank_id'],
                        'shift_log_id' => $shiftLog->id,
                        'reading_type' => 'closing',
                    ],
                    [
                        'dip_mm' => $dr['dip_mm'],
                        'liters_from_chart' => $closingLiters,
                        'water_dip_mm' => $dr['water_mm'] ?? 0,
                        'recorded_at' => now(),
                    ]
                );
            }

            // 3. Save supplies (purchasing/deliveries)
            if ($request->has('supplies')) {
                foreach ($request->input('supplies') as $supply) {
                    $tank = Tank::with('product')->findOrFail($supply['tank_id']);
                    $supplier = \App\Models\Supplier::findOrFail($supply['supplier_id']);
                    $totalAmount = round($supply['liters_received'] * $supply['cost_per_liter'], 2);

                    // Post Purchase Journal Entry
                    // DR Inventory (Fuel Asset) / CR Accounts Payable
                    $inventoryAccountId = $tank->product->inventory_account_id;
                    $apAccount = \App\Models\ChartOfAccount::where('station_id', $stationId)
                        ->whereIn('code', ['100501', '2100'])
                        ->first();

                    if (!$inventoryAccountId || !$apAccount) {
                        throw new \Exception('Inventory account or Accounts Payable control account is not configured.');
                    }

                    $journalEntries = [
                        [
                            'account_id' => $inventoryAccountId,
                            'debit' => $totalAmount,
                            'credit' => 0,
                            'description' => "Received {$supply['liters_received']}L of {$tank->product->name} (Shift #{$shiftLog->id})",
                        ],
                        [
                            'account_id' => $apAccount->id,
                            'debit' => 0,
                            'credit' => $totalAmount,
                            'description' => "Payable to {$supplier->name} for {$tank->product->name} delivery (Shift #{$shiftLog->id})",
                        ]
                    ];

                    $journal = app(\App\Services\AccountingService::class)->post([
                        'station_id' => $stationId,
                        'type' => 'purchase',
                        'date' => $shiftLog->date->format('Y-m-d'),
                        'narration' => "Fuel delivery: {$tank->name} - {$supply['liters_received']}L from {$supplier->name} (Shift #{$shiftLog->id})",
                        'reference_type' => \App\Models\TankDelivery::class,
                        'reference_id' => null, // will fill below
                        'entries' => $journalEntries,
                    ], $userId);

                    $delivery = \App\Models\TankDelivery::create([
                        'station_id' => $stationId,
                        'tank_id' => $supply['tank_id'],
                        'supplier_id' => $supply['supplier_id'],
                        'delivery_date' => $shiftLog->date,
                        'liters_received' => $supply['liters_received'],
                        'cost_per_liter' => $supply['cost_per_liter'],
                        'total_amount' => $totalAmount,
                        'recorded_by' => $userId,
                        'journal_id' => $journal->id,
                        'shift_log_id' => $shiftLog->id,
                    ]);

                    $journal->update([
                        'reference_id' => $delivery->id,
                    ]);

                    // Update physical tank stock levels
                    $tank->increment('current_liters', $supply['liters_received']);

                    // Update supplier credit balance
                    $supplier->increment('balance', $totalAmount);
                }
            }

            // 4. Save Cash collection
            CashCollection::updateOrCreate(
                [
                    'shift_log_id' => $shiftLog->id,
                ],
                [
                    'user_id' => $userId,
                    'amount' => $request->input('cash_amount'),
                    'notes' => $request->input('notes') ?? 'Shift cash collection',
                ]
            );

            // 5. Close Shift & Post Financial Journals
            app(ShiftClosingService::class)->closeShift($shiftLog, $userId);

            return redirect()->route('shift-logs.show', $shiftLog->id)
                ->with('success', 'Shift closed and journals posted successfully.');
        });
    }

    public function verify(ShiftLog $shiftLog): RedirectResponse
    {
        $shiftLog->update(['status' => 'verified']);
        return redirect()->back()->with('success', 'Shift log verified.');
    }
}
