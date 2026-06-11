<?php

namespace App\Services;

use App\Models\ShiftLog;
use App\Models\Tank;
use App\Models\TankDipReading;
use App\Models\ShiftSale;
use App\Models\TankDelivery;

class StockReconciliationService
{
    public function reconcile(ShiftLog $shiftLog): array
    {
        $reconciliation = [];

        // For each tank in the station
        $tanks = Tank::with(['product', 'nozzles'])
            ->where('station_id', $shiftLog->station_id)
            ->where('is_active', true)
            ->get();

        foreach ($tanks as $tank) {
            // Find opening dip reading for this shift
            $openingReading = TankDipReading::where('shift_log_id', $shiftLog->id)
                ->where('tank_id', $tank->id)
                ->where('reading_type', 'opening')
                ->first();

            // Find closing dip reading for this shift
            $closingReading = TankDipReading::where('shift_log_id', $shiftLog->id)
                ->where('tank_id', $tank->id)
                ->where('reading_type', 'closing')
                ->first();

            $openingLiters = $openingReading ? (double)$openingReading->liters_from_chart : (double)$tank->current_liters;
            $closingLiters = $closingReading ? (double)$closingReading->liters_from_chart : (double)$tank->current_liters;

            // Deliveries during the shift for this tank
            $deliveries = TankDelivery::where('tank_id', $tank->id)
                ->where(function ($query) use ($shiftLog) {
                    $query->where('shift_log_id', $shiftLog->id)
                          ->orWhere(function ($q) use ($shiftLog) {
                              $q->whereNull('shift_log_id')
                                ->whereDate('delivery_date', $shiftLog->date);
                          });
                })
                ->sum('liters_received');

            // Sales according to meters for this tank's nozzles
            $nozzleIds = $tank->nozzles->pluck('id');
            $meterSales = ShiftSale::where('shift_log_id', $shiftLog->id)
                ->whereIn('nozzle_id', $nozzleIds)
                ->sum('liters_sold');

            // Physical sales = Opening stock + Deliveries - Closing stock
            $physicalSales = round(($openingLiters + $deliveries) - $closingLiters, 4);

            // Variance = physicalSales - meterSales
            $variance = round($physicalSales - $meterSales, 4);
            $variancePercentage = $meterSales > 0 ? round(($variance / $meterSales) * 100, 2) : 0;

            $reconciliation[] = [
                'tank_id' => $tank->id,
                'tank_name' => $tank->name,
                'product_name' => $tank->product->name,
                'opening_liters' => $openingLiters,
                'deliveries' => (double)$deliveries,
                'closing_liters' => $closingLiters,
                'physical_sales' => $physicalSales,
                'meter_sales' => (double)$meterSales,
                'variance' => $variance,
                'variance_percentage' => $variancePercentage,
            ];
        }

        return $reconciliation;
    }
}
