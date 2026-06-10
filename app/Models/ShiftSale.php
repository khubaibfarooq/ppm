<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_log_id',
        'nozzle_id',
        'product_id',
        'opening_reading',
        'closing_reading',
        'liters_sold',
        'sale_price',
        'cost_price',
        'gross_amount',
        'cost_amount',
    ];

    protected $casts = [
        'opening_reading' => 'double',
        'closing_reading' => 'double',
        'liters_sold' => 'double',
        'sale_price' => 'double',
        'cost_price' => 'double',
        'gross_amount' => 'double',
        'cost_amount' => 'double',
    ];

    public function shiftLog(): BelongsTo
    {
        return $this->belongsTo(ShiftLog::class);
    }

    public function nozzle(): BelongsTo
    {
        return $this->belongsTo(Nozzle::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
