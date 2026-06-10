<?php

namespace App\Services;

use App\Models\Tank;

class DipChartService
{
    public function dipToLiters(Tank $tank, int $dipMm): float
    {
        $chart = $tank->dipChart; // ordered by dip_mm

        if ($chart->isEmpty()) {
            throw new \RuntimeException("No dip calibration chart found for tank: {$tank->name}");
        }

        $exact = $chart->firstWhere('dip_mm', $dipMm);
        if ($exact) {
            return (float) $exact->liters;
        }

        $lower = $chart->filter(fn($r) => $r->dip_mm < $dipMm)->last();
        $upper = $chart->filter(fn($r) => $r->dip_mm > $dipMm)->first();

        if (!$lower) {
            return (float) $upper->liters;
        }
        if (!$upper) {
            return (float) $lower->liters;
        }

        $ratio = ($dipMm - $lower->dip_mm) / ($upper->dip_mm - $lower->dip_mm);
        return round($lower->liters + $ratio * ($upper->liters - $lower->liters), 4);
    }
}
