<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $stationId = auth()->user()->station_id;
        $staff = User::where('station_id', $stationId)->get();

        return Inertia::render('Staff/Attendance', [
            'staff' => $staff,
        ]);
    }
}
