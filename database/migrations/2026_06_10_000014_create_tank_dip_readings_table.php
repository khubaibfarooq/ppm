<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tank_dip_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tank_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_log_id')->constrained()->cascadeOnDelete();
            $table->enum('reading_type', ['opening', 'closing']);
            $table->integer('dip_mm');
            $table->decimal('liters_from_chart', 14, 4)->default(0);
            $table->integer('water_dip_mm')->default(0);
            $table->dateTime('recorded_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tank_dip_readings');
    }
};
