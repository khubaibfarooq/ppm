<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'debit_total',
        'credit_total',
        'balance',
    ];

    protected $casts = [
        'debit_total' => 'double',
        'credit_total' => 'double',
        'balance' => 'double',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }
}
