<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->dateTime('opened_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['open', 'closed', 'verified'])->default('open');
            $table->decimal('total_liters_sold', 14, 4)->default(0);
            $table->decimal('total_revenue', 14, 2)->default(0);
            $table->decimal('total_cash', 14, 2)->default(0);
            $table->decimal('short_excess', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->timestamps();

            $table->unique(['station_id', 'shift_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_logs');
    }
};
