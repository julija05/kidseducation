<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CSRF Token Settings
    |--------------------------------------------------------------------------
    |
    | These settings control how CSRF tokens are handled in the application
    |
    */

    // Refresh CSRF tokens automatically for AJAX requests
    'auto_refresh' => env('CSRF_AUTO_REFRESH', true),
    
    // CSRF token timeout in minutes
    'token_timeout' => env('CSRF_TOKEN_TIMEOUT', 120),
    
    // Domains to trust for CSRF validation
    'trusted_domains' => [
        env('APP_URL'),
        'https://' . parse_url(env('APP_URL'), PHP_URL_HOST),
        'http://' . parse_url(env('APP_URL'), PHP_URL_HOST),
    ],
    
    // Routes that should bypass CSRF protection
    'except' => [
        'webhooks/*',
        'api/public/*',
    ],
];