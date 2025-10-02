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
        Schema::create('museum_overlays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('museum_id')->constrained('museum')->onDelete('cascade');
            $table->string('overlay_url');
            $table->string('position');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('museum_overlays');
    }
};
