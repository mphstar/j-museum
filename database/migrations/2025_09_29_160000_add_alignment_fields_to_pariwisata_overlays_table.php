<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            // Semantic alignment fields replacing manual x/y when desired
            $table->string('position_horizontal', 16)->nullable()->after('position'); // left, center, right
            $table->string('position_vertical', 16)->nullable()->after('position_horizontal'); // top, center, bottom
            $table->string('object_fit', 16)->nullable()->after('position_vertical'); // contain, cover, fill, none, scale-down, crop(custom)
        });
    }

    public function down(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            $table->dropColumn(['position_horizontal','position_vertical','object_fit']);
        });
    }
};
