<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained()->cascadeOnDelete();
            $table->string('journal_number', 30);
            $table->enum('type', ['general', 'sales', 'purchase', 'cash', 'bank', 'salary'])->default('general');
            $table->nullableMorphs('reference');
            $table->date('date');
            $table->text('narration')->nullable();
            $table->boolean('is_posted')->default(false);
            $table->boolean('is_reversed')->default(false);
            $table->foreignId('reversed_by')->nullable()->constrained('journals')->nullOnDelete();
            $table->decimal('total_debit', 16, 4)->default(0);
            $table->decimal('total_credit', 16, 4)->default(0);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('posted_by')->nullable()->constrained('users');
            $table->dateTime('posted_at')->nullable();
            $table->timestamps();

            $table->unique(['station_id', 'journal_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};
