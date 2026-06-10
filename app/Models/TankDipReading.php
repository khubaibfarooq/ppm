<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TankDipReading extends Model
{
    use HasFactory;

    protected $table = 'tank_dip_readings';

    protected $fillable = [
        'tank_id',
        'shift_log_id',
        'reading_type',
        'dip_mm',
        'liters_from_chart',
        'water_dip_mm',
        'recorded_at',
    ];

    protected $casts = [
        'dip_mm' => 'integer',
        'liters_from_chart' => 'double',
        'water_dip_mm' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function tank(): BelongsTo
    {
        return $this->belongsTo(Tank::class);
    }

    public function shiftLog(): BelongsTo
    {
        return $this->belongsTo(ShiftLog::class);
    }
}
