<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nozzle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_log_id')->constrained()->cascadeOnDelete();
            $table->enum('reading_type', ['opening', 'closing']);
            $table->decimal('reading_value', 16, 4);
            $table->dateTime('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
    }
};
