<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('code', 50);
            $table->string('unit', 20)->default('Liters');
            $table->enum('type', ['fuel', 'lubricant', 'other'])->default('fuel');
            $table->decimal('current_price', 12, 2)->default(0);
            $table->decimal('current_cost', 12, 2)->default(0);
            $table->foreignId('revenue_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->foreignId('cogs_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->foreignId('inventory_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['station_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
