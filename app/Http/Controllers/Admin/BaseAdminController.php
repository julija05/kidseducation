<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

abstract class BaseAdminController extends Controller
{
    /**
     * Get the resource name for success messages
     */
    abstract protected function getResourceName(): string;

    /**
     * Get the index route name
     */
    abstract protected function getIndexRouteName(): string;

    /**
     * Create a success redirect response
     */
    protected function successRedirect(string $action): RedirectResponse
    {
        $resourceName = $this->getResourceName();
        $message = ucfirst($resourceName) . " {$action} successfully.";

        return redirect()
            ->route($this->getIndexRouteName())
            ->with('success', $message);
    }

    /**
     * Create an error redirect response
     */
    protected function errorRedirect(string $action, string $error = null): RedirectResponse
    {
        $resourceName = $this->getResourceName();
        $message = $error ?: "Failed to {$action} {$resourceName}.";

        return redirect()
            ->back()
            ->with('error', $message)
            ->withInput();
    }
}
