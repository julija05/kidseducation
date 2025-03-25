<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

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
                    'title' => $program->title,
                    'description' => $program->description,
                    'price' => number_format($program->price, 2),
                    'duration' => $program->duration
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
        $this->programs = $this->cachedControllerData['programs']->sortBy('title');
        $this->templateValues['programs'] = $this->programs;
    }

    protected function createView(string $templateName, array $values = [])
    {
        $template = $this->templateValues;
        return Inertia::render($templateName, array_merge($template, $values));
    }
}
