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
        $stationId = auth()->user()->station_id;

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
        $stationId = auth()->user()->station_id;

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

        return redirect()->route('shifts.show', $shiftLog->id)
            ->with('success', 'Shift opened successfully.');
    }

    public function closeForm(ShiftLog $shiftLog): Response
    {
        $stationId = auth()->user()->station_id;

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
            ->get();

        return Inertia::render('Shifts/Close', [
            'shiftLog' => $shiftLog,
            'nozzles' => $nozzles,
            'tanks' => $tanks,
        ]);
    }

    public function close(Request $request, ShiftLog $shiftLog): RedirectResponse
    {
        $request->validate([
            'meter_readings' => 'required|array',
            'meter_readings.*.nozzle_id' => 'required|exists:nozzles,id',
            'meter_readings.*.closing' => 'required|numeric|min:0',
            'dip_readings' => 'required|array',
            'dip_readings.*.tank_id' => 'required|exists:tanks,id',
            'dip_readings.*.dip_mm' => 'required|integer|min:0',
            'dip_readings.*.water_mm' => 'nullable|integer|min:0',
            'cash_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // 1. Save closing meter readings
        foreach ($request->input('meter_readings') as $mr) {
            MeterReading::create([
                'nozzle_id' => $mr['nozzle_id'],
                'shift_log_id' => $shiftLog->id,
                'reading_type' => 'closing',
                'reading_value' => $mr['closing'],
                'recorded_at' => now(),
            ]);
        }

        // 2. Save closing dip readings
        foreach ($request->input('dip_readings') as $dr) {
            $tank = Tank::findOrFail($dr['tank_id']);
            $liters = app(DipChartService::class)->dipToLiters($tank, $dr['dip_mm']);

            TankDipReading::create([
                'tank_id' => $dr['tank_id'],
                'shift_log_id' => $shiftLog->id,
                'reading_type' => 'closing',
                'dip_mm' => $dr['dip_mm'],
                'liters_from_chart' => $liters,
                'water_dip_mm' => $dr['water_mm'] ?? 0,
                'recorded_at' => now(),
            ]);
        }

        // 3. Save Cash collection
        if ($request->input('cash_amount') > 0) {
            CashCollection::create([
                'shift_log_id' => $shiftLog->id,
                'user_id' => auth()->id(),
                'amount' => $request->input('cash_amount'),
                'notes' => $request->input('notes') ?? 'Shift cash collection',
            ]);
        }

        // 4. Close Shift & Post Financial Journals
        app(ShiftClosingService::class)->closeShift($shiftLog, auth()->id());

        return redirect()->route('shifts.show', $shiftLog->id)
            ->with('success', 'Shift closed and journals posted successfully.');
    }

    public function verify(ShiftLog $shiftLog): RedirectResponse
    {
        $shiftLog->update(['status' => 'verified']);
        return redirect()->back()->with('success', 'Shift log verified.');
    }
}
