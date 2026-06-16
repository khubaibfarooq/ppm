<?php

set_time_limit(0);

echo "Starting Vite dev server and Laravel development server...\n";

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$npmCmd = $isWindows ? 'npm.cmd run dev' : 'npm run dev';
$artisanCmd = PHP_BINARY . ' artisan serve';

$descriptors = [
    0 => STDIN,
    1 => STDOUT,
    2 => STDERR,
];

$process1 = proc_open($npmCmd, $descriptors, $pipes1);
$process2 = proc_open($artisanCmd, $descriptors, $pipes2);

if (!is_resource($process1) || !is_resource($process2)) {
    echo "Failed to start processes.\n";
    if (is_resource($process1)) proc_close($process1);
    if (is_resource($process2)) proc_close($process2);
    exit(1);
}

// Support graceful shutdown on Unix-like systems if PCNTL is available
if (function_exists('pcntl_signal')) {
    declare(ticks = 1);
    $handler = function () use ($process1, $process2) {
        proc_terminate($process1);
        proc_terminate($process2);
        exit(0);
    };
    pcntl_signal(SIGINT, $handler);
    pcntl_signal(SIGTERM, $handler);
}

// Keep the parent process alive and check on children
try {
    while (true) {
        $status1 = proc_get_status($process1);
        $status2 = proc_get_status($process2);

        if (!$status1['running'] || !$status2['running']) {
            break;
        }

        usleep(200000); // Check every 200ms
    }
} finally {
    // Make sure to clean up the processes on exit
    proc_terminate($process1);
    proc_terminate($process2);
    proc_close($process1);
    proc_close($process2);
}
