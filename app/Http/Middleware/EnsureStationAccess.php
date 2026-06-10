<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStationAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && !auth()->user()->station_id && !auth()->user()->hasRole('super_admin')) {
            abort(403, 'You are not assigned to any station.');
        }

        return $next($request);
    }
}
