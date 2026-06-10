<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tank extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'product_id',
        'name',
        'capacity_liters',
        'current_liters',
        'low_level_alert',
        'is_active',
    ];

    protected $casts = [
        'capacity_liters' => 'double',
        'current_liters' => 'double',
        'low_level_alert' => 'double',
        'is_active' => 'boolean',
    ];

    protected $appends = ['fill_percentage'];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function dipChart(): HasMany
    {
        return $this->hasMany(TankDipChart::class)->orderBy('dip_mm');
    }

    public function nozzles(): HasMany
    {
        return $this->hasMany(Nozzle::class);
    }

    public function dipReadings(): HasMany
    {
        return $this->hasMany(TankDipReading::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(TankDelivery::class);
    }

    public function getFillPercentageAttribute(): float
    {
        return $this->capacity_liters > 0
            ? round(($this->current_liters / $this->capacity_liters) * 100, 1)
            : 0;
    }
}
