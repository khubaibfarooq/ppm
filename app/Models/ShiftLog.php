<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'shift_id',
        'date',
        'opened_at',
        'closed_at',
        'opened_by',
        'closed_by',
        'status',
        'total_liters_sold',
        'total_revenue',
        'total_cash',
        'short_excess',
        'notes',
        'journal_id',
    ];

    protected $casts = [
        'date' => 'date',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'total_liters_sold' => 'double',
        'total_revenue' => 'double',
        'total_cash' => 'double',
        'short_excess' => 'double',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(ShiftSale::class);
    }

    public function meterReadings(): HasMany
    {
        return $this->hasMany(MeterReading::class);
    }

    public function dipReadings(): HasMany
    {
        return $this->hasMany(TankDipReading::class);
    }

    public function cashCollections(): HasMany
    {
        return $this->hasMany(CashCollection::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
