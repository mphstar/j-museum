<?php

namespace Database\Factories;

use App\Models\Museum;
use App\Models\Pariwisata;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pariwisata>
 */
class MuseumFactory extends Factory
{
    protected $model = Museum::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(3);
        return [
            'title' => $title,
            'label' => $this->faker->randomElement(['Promo','Baru','Favorit', null]),
            'subtitle' => $this->faker->sentence(6),
            'slug' => Str::slug($title . '-' . Str::random(5)),
            'content' => $this->faker->paragraphs(2, true),
            'background_url' => $this->faker->imageUrl(800, 600, 'nature', true),
            'cta_href' => $this->faker->url(),
            'cta_label' => $this->faker->randomElement(['Lihat', 'Pesan', 'Detail']),
            'align' => $this->faker->randomElement(['left','right'])
        ];
    }
}
