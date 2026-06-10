<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $shifts = Shift::where('station_id', $stationId)->get();

        return Inertia::render('Shifts/Templates', [
            'shifts' => $shifts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
        ]);

        $validated['station_id'] = $stationId;

        Shift::create($validated);

        return redirect()->back()->with('success', 'Shift template created successfully.');
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required',
            'is_active' => 'required|boolean',
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Shift template updated successfully.');
    }

    public function destroy(Shift $shift): RedirectResponse
    {
        $shift->delete();
        return redirect()->back()->with('success', 'Shift template deleted successfully.');
    }
}
