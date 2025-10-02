<?php

namespace Database\Factories;

use App\Models\Museum;
use App\Models\MuseumOverlays;
use App\Models\PariwisataOverlays;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PariwisataOverlays>
 */
class MuseumOverlaysFactory extends Factory
{
    protected $model = MuseumOverlays::class;

    public function definition(): array
    {
        return [
            'museum_id' => Museum::factory(),
            'overlay_url' => $this->faker->imageUrl(200, 200, 'abstract', true),
            'position_horizontal' => $this->faker->randomElement(['left','center','right']),
            'position_vertical' => $this->faker->randomElement(['top','center','bottom']),
            'object_fit' => $this->faker->randomElement(['contain','cover','fill','none'])
        ];
    }
}
