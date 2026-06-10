<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'user_id',
        'payment_date',
        'basic_salary',
        'bonus',
        'deductions',
        'net_amount',
        'payment_method',
        'journal_id',
        'processed_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'basic_salary' => 'double',
        'bonus' => 'double',
        'deductions' => 'double',
        'net_amount' => 'double',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
