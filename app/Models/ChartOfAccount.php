<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChartOfAccount extends Model
{
    use HasFactory;

    protected $table = 'chart_of_accounts';

    protected $fillable = [
        'station_id',
        'code',
        'name',
        'type',
        'sub_type',
        'parent_id',
        'is_control',
        'is_system',
        'normal_balance',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_control' => 'boolean',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function balance(): HasOne
    {
        return $this->hasOne(AccountBalance::class, 'account_id');
    }
}
