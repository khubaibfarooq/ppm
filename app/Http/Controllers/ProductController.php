<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductPriceHistory;
use App\Models\ChartOfAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $products = Product::with(['revenueAccount', 'cogsAccount', 'inventoryAccount'])
            ->where('station_id', $stationId)
            ->get();

        // Get asset/revenue/expense accounts for mapping
        $accounts = ChartOfAccount::where('station_id', $stationId)
            ->where('is_active', true)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'code' => $a->code,
                'name' => $a->name,
                'type' => $a->type,
            ]);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'type' => 'required|in:fuel,lubricant,other',
            'current_price' => 'required|numeric|min:0',
            'current_cost' => 'required|numeric|min:0',
            'revenue_account_id' => 'nullable|exists:chart_of_accounts,id',
            'cogs_account_id' => 'nullable|exists:chart_of_accounts,id',
            'inventory_account_id' => 'nullable|exists:chart_of_accounts,id',
        ]);

        $validated['station_id'] = $stationId;

        $product = Product::create($validated);

        // Record initial price history
        ProductPriceHistory::create([
            'product_id' => $product->id,
            'cost_price' => $product->current_cost,
            'selling_price' => $product->current_price,
            'effective_from' => now(),
            'changed_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'type' => 'required|in:fuel,lubricant,other',
            'revenue_account_id' => 'nullable|exists:chart_of_accounts,id',
            'cogs_account_id' => 'nullable|exists:chart_of_accounts,id',
            'inventory_account_id' => 'nullable|exists:chart_of_accounts,id',
            'is_active' => 'required|boolean',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function updatePrice(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'current_cost' => 'required|numeric|min:0',
            'current_price' => 'required|numeric|min:0',
        ]);

        $product->update([
            'current_cost' => $validated['current_cost'],
            'current_price' => $validated['current_price'],
        ]);

        ProductPriceHistory::create([
            'product_id' => $product->id,
            'cost_price' => $validated['current_cost'],
            'selling_price' => $validated['current_price'],
            'effective_from' => now(),
            'changed_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Product price updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
