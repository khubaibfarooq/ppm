<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'nozzle_id',
        'shift_log_id',
        'reading_type',
        'reading_value',
        'recorded_at',
    ];

    protected $casts = [
        'reading_value' => 'double',
        'recorded_at' => 'datetime',
    ];

    public function nozzle(): BelongsTo
    {
        return $this->belongsTo(Nozzle::class);
    }

    public function shiftLog(): BelongsTo
    {
        return $this->belongsTo(ShiftLog::class);
    }

    public function scopeShiftNozzle(Builder $query, int $shiftLogId, int $nozzleId, string $readingType): Builder
    {
        return $query->where('shift_log_id', $shiftLogId)
                     ->where('nozzle_id', $nozzleId)
                     ->where('reading_type', $readingType);
    }
}
