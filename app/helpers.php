<?php

use App\Models\Setting;

if (!function_exists('setting')) {
    function setting(string $key, ?int $stationId = null, $default = null)
    {
        $stationId = $stationId ?? (auth()->check() ? auth()->user()->station_id : null);
        if (!$stationId) {
            return $default;
        }
        return Setting::getValue($key, $stationId, $default);
    }
}

if (!function_exists('array_all')) {
    function array_all(array $array, callable $callback): bool
    {
        foreach ($array as $key => $value) {
            if (!$callback($value, $key)) {
                return false;
            }
        }
        return true;
    }
}
