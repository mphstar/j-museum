<?php

namespace Database\Factories;

use App\Models\PariwisataOverlays;
use App\Models\Pariwisata;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PariwisataOverlays>
 */
class PariwisataOverlaysFactory extends Factory
{
    protected $model = PariwisataOverlays::class;

    public function definition(): array
    {
        return [
            'pariwisata_id' => Pariwisata::factory(),
            'overlay_url' => $this->faker->imageUrl(200, 200, 'abstract', true),
            'position_horizontal' => $this->faker->randomElement(['left','center','right']),
            'position_vertical' => $this->faker->randomElement(['top','center','bottom']),
            'object_fit' => $this->faker->randomElement(['contain','cover','fill','none'])
        ];
    }
}
