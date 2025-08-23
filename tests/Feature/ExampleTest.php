<?php

namespace Tests\Feature;

use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        // Create a sample program since the home page likely queries programs
        Program::create([
            'name' => 'Test Program',
            'slug' => 'test-program',
            'description' => 'Test description',
            'duration' => '4 weeks',
            'price' => 99.99,
            'is_active' => true,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
