<?php

namespace App\Http\Controllers;

use App\Models\CashCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CashCollectionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shift_log_id' => 'required|exists:shift_logs,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        CashCollection::create($validated);

        return redirect()->back()->with('success', 'Cash collection recorded successfully.');
    }
}
