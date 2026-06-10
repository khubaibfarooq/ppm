<?php

namespace App\Http\Controllers;

use App\Models\MeterReading;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MeterReadingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nozzle_id' => 'required|exists:nozzles,id',
            'shift_log_id' => 'required|exists:shift_logs,id',
            'reading_type' => 'required|in:opening,closing',
            'reading_value' => 'required|numeric|min:0',
        ]);

        $validated['recorded_at'] = now();

        MeterReading::create($validated);

        return redirect()->back()->with('success', 'Meter reading recorded successfully.');
    }
}
