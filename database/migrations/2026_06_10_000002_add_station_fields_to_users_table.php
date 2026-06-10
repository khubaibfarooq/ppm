<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('station_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code', 20)->unique()->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('cnic', 20)->unique()->nullable();
            $table->text('address')->nullable();
            $table->string('designation', 100)->nullable();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->date('join_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'terminated'])->default('active');
            $table->string('profile_photo')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['station_id']);
            $table->dropColumn([
                'station_id',
                'employee_code',
                'phone',
                'cnic',
                'address',
                'designation',
                'basic_salary',
                'join_date',
                'status',
                'profile_photo'
            ]);
        });
    }
};
