<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TankDelivery extends Model
{
    use HasFactory;

    protected $table = 'tank_deliveries';

    protected $fillable = [
        'station_id',
        'tank_id',
        'supplier_id',
        'delivery_date',
        'liters_received',
        'cost_per_liter',
        'total_amount',
        'recorded_by',
        'journal_id',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'liters_received' => 'double',
        'cost_per_liter' => 'double',
        'total_amount' => 'double',
    ];

    public function tank(): BelongsTo
    {
        return $this->belongsTo(Tank::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
