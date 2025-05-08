<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

abstract class Controller
{
    protected Collection $programs;
    protected array $cachedControllerData = [];
    protected array $templateValues = [];

    public function __construct()
    {
        $this->setCachedControllerData();
        $this->setUpAllPrograms();
    }



    private function getCachedControllerDataForPrograms(): Collection
    {
        return Cache::rememberForever('controllerData.programs', function () {
            return Program::all()->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'price' => number_format($program->price, 2),
                    'duration' => $program->duration,
                    'image' => $program->image ? asset('storage/' . $program->image) : null,
                ];
            });
        });
    }

    protected function setCachedControllerData(): void
    {
        $this->cachedControllerData['programs'] = $this->getCachedControllerDataForPrograms();
    }

    /**
     * Takes data from cache by filtering cachedControllerData['programs']
     * @return void
     */
    private function setUpAllPrograms(): void
    {
        $this->templateValues['programs'] = $this->cachedControllerData['programs']
            ->sortBy('name')
            ->values()
            ->toArray();
    }

    protected function createView(string $templateName, array $values = [])
    {
        $template = $this->templateValues;
        return Inertia::render($templateName, array_merge($template, $values));
    }
}
