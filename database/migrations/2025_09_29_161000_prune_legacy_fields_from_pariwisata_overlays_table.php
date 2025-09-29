<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            // Drop legacy freeform layout fields no longer needed
            if (Schema::hasColumn('pariwisata_overlays','x')) {
                $table->dropColumn(['x','y','width','height','rotation','scale_x','scale_y','z_index','opacity','extra','position']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            // Re-create columns (best-effort defaults) if rollback
            $table->string('position')->nullable();
            $table->integer('x')->default(0);
            $table->integer('y')->default(0);
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->float('rotation')->default(0);
            $table->float('scale_x')->default(1);
            $table->float('scale_y')->default(1);
            $table->integer('z_index')->default(0);
            $table->float('opacity')->default(1);
            $table->json('extra')->nullable();
        });
    }
};
