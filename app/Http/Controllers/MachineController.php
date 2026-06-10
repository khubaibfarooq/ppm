<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\Nozzle;
use App\Models\Tank;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $machines = Machine::with(['nozzles.tank', 'nozzles.product'])
            ->where('station_id', $stationId)
            ->get();

        $tanks = Tank::where('station_id', $stationId)->where('is_active', true)->get();
        $products = Product::where('station_id', $stationId)->where('type', 'fuel')->where('is_active', true)->get();

        return Inertia::render('Machines/Index', [
            'machines' => $machines,
            'tanks' => $tanks,
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
        ]);

        $validated['station_id'] = $stationId;

        Machine::create($validated);

        return redirect()->back()->with('success', 'Dispenser machine created successfully.');
    }

    public function update(Request $request, Machine $machine): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'is_active' => 'required|boolean',
        ]);

        $machine->update($validated);

        return redirect()->back()->with('success', 'Dispenser machine updated successfully.');
    }

    public function destroy(Machine $machine): RedirectResponse
    {
        $machine->delete();
        return redirect()->back()->with('success', 'Dispenser machine deleted successfully.');
    }
}
