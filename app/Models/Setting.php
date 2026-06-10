<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'key',
        'value',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }

    public static function getValue(string $key, int $stationId, $default = null)
    {
        $setting = self::where('station_id', $stationId)->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }
}
