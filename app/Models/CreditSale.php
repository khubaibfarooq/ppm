<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_log_id',
        'customer_id',
        'vehicle_id',
        'product_id',
        'liters_sold',
        'sale_price',
        'total_amount',
        'vehicle_number',
        'slip_number',
        'recorded_by',
    ];

    protected $casts = [
        'liters_sold' => 'double',
        'sale_price' => 'double',
        'total_amount' => 'double',
    ];

    public function shiftLog(): BelongsTo
    {
        return $this->belongsTo(ShiftLog::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
