<?php

namespace App\Http\Controllers;

use App\Models\Station;
use Database\Seeders\ChartOfAccountsSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StationController extends Controller
{
    private function checkPermission()
    {
        if (!auth()->user()->hasRole('super_admin') && !auth()->user()->hasPermissionTo('manage stations')) {
            abort(403, 'Unauthorized action. Only global administrators can manage stations.');
        }
    }

    public function index(): Response
    {
        $this->checkPermission();

        $stations = Station::orderBy('id', 'desc')->get();

        return Inertia::render('Stations/Index', [
            'stations' => $stations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->checkPermission();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
        ]);

        $station = Station::create($validated);

        // Run Chart of Accounts Seeder for the new station
        $coaSeeder = new ChartOfAccountsSeeder();
        $coaSeeder->run($station->id);

        return redirect()->back()->with('success', 'Station created successfully and Default Chart of Accounts initialized.');
    }

    public function update(Request $request, Station $station): RedirectResponse
    {
        $this->checkPermission();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
            'is_active' => 'required|boolean',
        ]);

        $station->update($validated);

        return redirect()->back()->with('success', 'Station updated successfully.');
    }

    public function destroy(Station $station): RedirectResponse
    {
        $this->checkPermission();

        $station->delete();

        return redirect()->back()->with('success', 'Station deleted successfully.');
    }
}
