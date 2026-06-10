<?php

namespace App\Http\Controllers;

use App\Models\ChartOfAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $accounts = ChartOfAccount::with('balance')
            ->where('station_id', $stationId)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:chart_of_accounts,code,NULL,id,station_id,' . $stationId,
            'name' => 'required|string|max:150',
            'type' => 'required|in:asset,liability,equity,revenue,expense',
            'sub_type' => 'nullable|string|max:50',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'is_control' => 'required|boolean',
            'normal_balance' => 'required|in:debit,credit',
            'description' => 'nullable|string',
        ]);

        $validated['station_id'] = $stationId;

        ChartOfAccount::create($validated);

        return redirect()->back()->with('success', 'GL Account created successfully.');
    }

    public function update(Request $request, ChartOfAccount $account): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:chart_of_accounts,code,' . $account->id . ',id,station_id,' . $stationId,
            'name' => 'required|string|max:150',
            'type' => 'required|in:asset,liability,equity,revenue,expense',
            'sub_type' => 'nullable|string|max:50',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'is_control' => 'required|boolean',
            'normal_balance' => 'required|in:debit,credit',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        if ($account->is_system && ($account->code !== $validated['code'] || $account->type !== $validated['type'] || $account->normal_balance !== $validated['normal_balance'])) {
            return redirect()->back()->with('error', 'Cannot modify system key attributes of a system account.');
        }

        $account->update($validated);

        return redirect()->back()->with('success', 'GL Account updated successfully.');
    }

    public function destroy(ChartOfAccount $account): RedirectResponse
    {
        if ($account->is_system) {
            return redirect()->back()->with('error', 'Cannot delete system-defined accounts.');
        }

        $account->delete();
        return redirect()->back()->with('success', 'GL Account deleted successfully.');
    }
}
