<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function shift($shiftLog)
    {
        return response()->json(['message' => 'Shift export data is ready.']);
    }

    public function report($type)
    {
        return response()->json(['message' => "$type report export is ready."]);
    }
}
