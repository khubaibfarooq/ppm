<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashCollection extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_log_id',
        'user_id',
        'amount',
        'notes',
    ];

    protected $casts = [
        'amount' => 'double',
    ];

    public function shiftLog(): BelongsTo
    {
        return $this->belongsTo(ShiftLog::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
