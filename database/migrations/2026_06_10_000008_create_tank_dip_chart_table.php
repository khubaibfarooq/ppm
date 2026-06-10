<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tank_dip_chart', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tank_id')->constrained()->cascadeOnDelete();
            $table->integer('dip_mm');
            $table->decimal('liters', 14, 4);
            $table->timestamps();

            $table->unique(['tank_id', 'dip_mm']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tank_dip_chart');
    }
};
