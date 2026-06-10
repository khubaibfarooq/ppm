<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TankDipChart extends Model
{
    use HasFactory;

    protected $table = 'tank_dip_chart';

    protected $fillable = [
        'tank_id',
        'dip_mm',
        'liters',
    ];

    protected $casts = [
        'dip_mm' => 'integer',
        'liters' => 'double',
    ];

    public function tank(): BelongsTo
    {
        return $this->belongsTo(Tank::class);
    }
}
