<?php

namespace App\Http\Controllers;

use App\Models\Nozzle;
use App\Models\Machine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NozzleController extends Controller
{
    public function store(Request $request, Machine $machine): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'tank_id' => 'required|exists:tanks,id',
            'product_id' => 'required|exists:products,id',
            'label' => 'required|string|max:50',
        ]);

        $validated['station_id'] = $stationId;
        $validated['machine_id'] = $machine->id;

        Nozzle::create($validated);

        return redirect()->back()->with('success', 'Nozzle created successfully.');
    }

    public function update(Request $request, Nozzle $nozzle): RedirectResponse
    {
        $validated = $request->validate([
            'tank_id' => 'required|exists:tanks,id',
            'product_id' => 'required|exists:products,id',
            'label' => 'required|string|max:50',
            'is_active' => 'required|boolean',
        ]);

        $nozzle->update($validated);

        return redirect()->back()->with('success', 'Nozzle updated successfully.');
    }

    public function destroy(Nozzle $nozzle): RedirectResponse
    {
        $nozzle->delete();
        return redirect()->back()->with('success', 'Nozzle deleted successfully.');
    }
}
