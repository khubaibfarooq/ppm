<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('vehicle_number', 50);
            $table->decimal('balance', 14, 2)->default(0); // vehicle-specific A/R balance
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['customer_id', 'vehicle_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
