<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class RenderExceptionHandler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($request->header('X-Inertia')) {
            $status = 500;

            if ($exception instanceof HttpExceptionInterface) {
                $status = $exception->getStatusCode();
            }

            return Inertia::render('Error/Error', [
                'status' => $status,
                'message' => config('app.debug') ? $exception->getMessage() : 'Something went wrong.'
            ])
                ->toResponse($request)
                ->setStatusCode($status);
        }

        return parent::render($request, $exception);
    }
}
