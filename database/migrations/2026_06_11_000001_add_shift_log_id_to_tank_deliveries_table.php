<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tank_deliveries', function (Blueprint $table) {
            $table->foreignId('shift_log_id')
                ->nullable()
                ->after('journal_id')
                ->constrained('shift_logs')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tank_deliveries', function (Blueprint $table) {
            $table->dropForeign(['shift_log_id']);
            $table->dropColumn('shift_log_id');
        });
    }
};
