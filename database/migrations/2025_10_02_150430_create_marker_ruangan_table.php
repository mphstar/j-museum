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
        Schema::create('marker_ruangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ruangan_id')->constrained('ruangan')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('type', ['info', 'navigation'])->default('info');
            $table->foreignId('navigation_target')->nullable()->constrained('ruangan');
            $table->string('media_url')->nullable();
            $table->enum('media_type', ['image', 'video'])->nullable();
            $table->integer('media_width')->default(100);
            $table->integer('media_height')->default(100);
            $table->string('audio_url')->nullable();

            $table->float('position_yaw')->default(0);
            $table->float('position_pitch')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marker_ruangan');
    }
};
