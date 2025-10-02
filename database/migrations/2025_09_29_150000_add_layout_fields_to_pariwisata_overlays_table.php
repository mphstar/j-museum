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
        Schema::table('museum_overlays', function (Blueprint $table) {
            // Basic Cartesian position (pixels or logical units decided by frontend)
            $table->integer('x')->default(0)->after('position');
            $table->integer('y')->default(0)->after('x');
            // Size (nullable to allow auto-fit or intrinsic size)
            $table->integer('width')->nullable()->after('y');
            $table->integer('height')->nullable()->after('width');
            // Transform attributes
            $table->float('rotation')->default(0)->after('height'); // degrees
            $table->float('scale_x')->default(1)->after('rotation');
            $table->float('scale_y')->default(1)->after('scale_x');
            // Visual stacking & appearance
            $table->integer('z_index')->default(0)->after('scale_y');
            $table->float('opacity')->default(1)->after('z_index'); // 0..1
            // Flexible JSON for any future properties (e.g. filters, corner radius, anchor point, etc.)
            $table->json('extra')->nullable()->after('opacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('museum_overlays', function (Blueprint $table) {
            $table->dropColumn([
                'x', 'y', 'width', 'height', 'rotation', 'scale_x', 'scale_y', 'z_index', 'opacity', 'extra'
            ]);
        });
    }
};
