<?php

namespace App\Http\Controllers;

use App\Models\Tank;
use App\Models\Product;
use App\Models\TankDipChart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TankController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $tanks = Tank::with('product')
            ->where('station_id', $stationId)
            ->get();

        $products = Product::where('station_id', $stationId)
            ->where('type', 'fuel')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Tanks/Index', [
            'tanks' => $tanks,
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:100',
            'capacity_liters' => 'required|numeric|min:0',
            'current_liters' => 'required|numeric|min:0',
            'low_level_alert' => 'required|numeric|min:0',
        ]);

        $validated['station_id'] = $stationId;

        Tank::create($validated);

        return redirect()->back()->with('success', 'Tank created successfully.');
    }

    public function update(Request $request, Tank $tank): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:100',
            'capacity_liters' => 'required|numeric|min:0',
            'current_liters' => 'required|numeric|min:0',
            'low_level_alert' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $tank->update($validated);

        return redirect()->back()->with('success', 'Tank updated successfully.');
    }

    public function destroy(Tank $tank): RedirectResponse
    {
        $tank->delete();
        return redirect()->back()->with('success', 'Tank deleted successfully.');
    }

    public function dipChart(Tank $tank): Response
    {
        $tank->load('product');
        $dipChart = TankDipChart::where('tank_id', $tank->id)
            ->orderBy('dip_mm')
            ->get();

        return Inertia::render('Tanks/DipChart', [
            'tank' => $tank,
            'dipChart' => $dipChart,
        ]);
    }

    public function saveDipChart(Request $request, Tank $tank): RedirectResponse
    {
        $request->validate([
            'chart_data' => 'required|array',
            'chart_data.*.dip_mm' => 'required|integer|min:0',
            'chart_data.*.liters' => 'required|numeric|min:0',
        ]);

        // Wipe old chart points
        TankDipChart::where('tank_id', $tank->id)->delete();

        // Create new chart points
        foreach ($request->input('chart_data') as $row) {
            TankDipChart::create([
                'tank_id' => $tank->id,
                'dip_mm' => $row['dip_mm'],
                'liters' => $row['liters'],
            ]);
        }

        return redirect()->back()->with('success', 'Dip chart calibration updated successfully.');
    }
}
