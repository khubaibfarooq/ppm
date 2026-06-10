<?php

namespace App\Events;

use App\Models\ShiftLog;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShiftClosed
{
    use Dispatchable, SerializesModels;

    public ShiftLog $shiftLog;

    public function __construct(ShiftLog $shiftLog)
    {
        $this->shiftLog = $shiftLog;
    }
}
