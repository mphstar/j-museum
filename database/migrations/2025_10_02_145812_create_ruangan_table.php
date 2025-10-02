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
        Schema::create('ruangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('museum_id')->constrained('museum')->onDelete('cascade');
            $table->string('nama_ruangan');
            $table->string('slug')->unique();
            $table->boolean('is_main')->default(false);
            $table->string('panorama_url')->nullable();
            $table->string('audio_guide_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruangan');
    }
};
