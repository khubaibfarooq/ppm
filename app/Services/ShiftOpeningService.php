<?php

namespace App\Services;

use App\Models\ShiftLog;
use App\Models\MeterReading;
use App\Models\TankDipReading;
use App\Models\Tank;
use Illuminate\Support\Facades\DB;

class ShiftOpeningService
{
    public function open(array $data, int $openedBy): ShiftLog
    {
        return DB::transaction(function () use ($data, $openedBy) {
            $stationId = auth()->user()->station_id;

            $shiftLog = ShiftLog::create([
                'station_id' => $stationId,
                'shift_id' => $data['shift_id'],
                'date' => $data['date'],
                'opened_at' => now(),
                'opened_by' => $openedBy,
                'status' => 'open',
            ]);

            // Save nozzle opening readings
            foreach ($data['meter_readings'] as $mr) {
                MeterReading::create([
                    'nozzle_id' => $mr['nozzle_id'],
                    'shift_log_id' => $shiftLog->id,
                    'reading_type' => 'opening',
                    'reading_value' => $mr['reading_value'],
                    'recorded_at' => now(),
                ]);
            }

            // Save tank opening dip readings
            foreach ($data['dip_readings'] as $dr) {
                $tank = Tank::findOrFail($dr['tank_id']);
                $liters = app(DipChartService::class)->dipToLiters($tank, $dr['dip_mm']);

                TankDipReading::create([
                    'tank_id' => $dr['tank_id'],
                    'shift_log_id' => $shiftLog->id,
                    'reading_type' => 'opening',
                    'dip_mm' => $dr['dip_mm'],
                    'liters_from_chart' => $liters,
                    'water_dip_mm' => $dr['water_dip_mm'] ?? 0,
                    'recorded_at' => now(),
                ]);

                // Update current tank level
                $tank->update(['current_liters' => $liters]);
            }

            return $shiftLog;
        });
    }
}
