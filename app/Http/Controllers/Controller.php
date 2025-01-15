<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

abstract class Controller
{
    protected array $cachedControllerData = [];
    protected array $templateValues = [];
    
    protected function createView(string $templateName, array $values = [])
    {
        $template = $this->templateValues;
        return Inertia::render($templateName, array_merge($template, $values));
    }
}
