<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('museum', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('label')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('slug')->unique();
            $table->text('content')->nullable();
            $table->string('background_url')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('cta_label')->nullable();
            $table->enum('align', ['left', 'right'])->default('left');

            
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('museum');
    }
};
