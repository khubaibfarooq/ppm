<?php

namespace App\Http\Controllers;

use App\Models\TankDipReading;
use App\Models\Tank;
use App\Services\DipChartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DipReadingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tank_id' => 'required|exists:tanks,id',
            'shift_log_id' => 'required|exists:shift_logs,id',
            'reading_type' => 'required|in:opening,closing',
            'dip_mm' => 'required|integer|min:0',
            'water_dip_mm' => 'nullable|integer|min:0',
        ]);

        $tank = Tank::findOrFail($validated['tank_id']);
        $liters = app(DipChartService::class)->dipToLiters($tank, $validated['dip_mm']);

        TankDipReading::create([
            'tank_id' => $validated['tank_id'],
            'shift_log_id' => $validated['shift_log_id'],
            'reading_type' => $validated['reading_type'],
            'dip_mm' => $validated['dip_mm'],
            'liters_from_chart' => $liters,
            'water_dip_mm' => $validated['water_dip_mm'] ?? 0,
            'recorded_at' => now(),
        ]);

        $tank->update(['current_liters' => $liters]);

        return redirect()->back()->with('success', 'Dip reading recorded successfully.');
    }
}
