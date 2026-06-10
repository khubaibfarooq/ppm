<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->unique()->constrained('chart_of_accounts')->cascadeOnDelete();
            $table->decimal('debit_total', 16, 4)->default(0);
            $table->decimal('credit_total', 16, 4)->default(0);
            $table->decimal('balance', 16, 4)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_balances');
    }
};
