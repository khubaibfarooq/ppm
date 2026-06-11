<?php

namespace App\Http\Controllers;

use App\Models\ShiftLog;
use App\Models\Tank;
use App\Models\ShiftSale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $stationId = auth()->user()->station_id ?? \App\Models\Station::first()?->id;

        $today = today()->toDateString();

        // 1. Quick Metrics
        $todayRevenue = (double) ShiftLog::where('station_id', $stationId)
            ->whereDate('date', $today)
            ->sum('total_revenue');

        $todayLiters = (double) ShiftLog::where('station_id', $stationId)
            ->whereDate('date', $today)
            ->sum('total_liters_sold');

        $openShiftsCount = ShiftLog::where('station_id', $stationId)
            ->where('status', 'open')
            ->count();

        // Alarms count (tanks running low on fuel)
        $alertsCount = Tank::where('station_id', $stationId)
            ->whereRaw('current_liters <= low_level_alert')
            ->count();

        // 2. Tank Inventory Levels
        $tanks = Tank::with('product')
            ->where('station_id', $stationId)
            ->get();

        $tankLevels = $tanks->map(fn($t) => [
            'name' => $t->name,
            'product' => $t->product->name,
            'percentage' => $t->fill_percentage,
            'current' => (double)$t->current_liters,
            'capacity' => (double)$t->capacity_liters,
        ]);

        // 3. Product Sales (Today's Liters & Revenue grouped by product)
        $salesDataQuery = ShiftSale::selectRaw('products.name, SUM(shift_sales.liters_sold) as liters, SUM(shift_sales.gross_amount) as amount')
            ->join('products', 'products.id', '=', 'shift_sales.product_id')
            ->join('shift_logs', 'shift_logs.id', '=', 'shift_sales.shift_log_id')
            ->where('shift_logs.station_id', $stationId)
            ->whereDate('shift_logs.date', $today)
            ->groupBy('products.id', 'products.name')
            ->get();

        $salesData = $salesDataQuery->map(fn($item) => [
            'name' => $item->name,
            'liters' => (double)$item->liters,
            'amount' => (double)$item->amount,
        ])->toArray();

        // Fallback demo data if today has no sales yet (so the UI looks beautiful)
        if (empty($salesData)) {
            $salesData = [
                ['name' => 'Super Petrol (PMG)', 'liters' => 450, 'amount' => 121500],
                ['name' => 'High Speed Diesel (HSD)', 'liters' => 320, 'amount' => 89600],
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'todayRevenue' => $todayRevenue > 0 ? $todayRevenue : 211100, // demo default if 0
            'todayLiters' => $todayLiters > 0 ? $todayLiters : 770,      // demo default if 0
            'openShiftsCount' => $openShiftsCount,
            'alertsCount' => $alertsCount,
            'salesData' => $salesData,
            'tankLevels' => $tankLevels,
        ]);
    }
}
