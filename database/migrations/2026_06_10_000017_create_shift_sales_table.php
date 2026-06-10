<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_log_id')->constrained()->cascadeOnDelete();
            $table->foreignId('nozzle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('opening_reading', 16, 4);
            $table->decimal('closing_reading', 16, 4);
            $table->decimal('liters_sold', 14, 4);
            $table->decimal('sale_price', 12, 2);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->decimal('gross_amount', 14, 2);
            $table->decimal('cost_amount', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_sales');
    }
};
