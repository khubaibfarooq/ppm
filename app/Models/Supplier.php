<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'name',
        'company_name',
        'email',
        'phone',
        'address',
        'balance',
        'is_active',
    ];

    protected $casts = [
        'balance' => 'double',
        'is_active' => 'boolean',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(TankDelivery::class);
    }
}
