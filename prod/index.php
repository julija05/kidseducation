<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
// if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
//     require $maintenance;
// }

// Register the Composer autoloader...
require '/home/abacygmx/repositories/kidseducation/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once '/home/abacygmx/repositories/kidseducation/bootstrap/app.php')
    ->handleRequest(Illuminate\Http\Request::capture());
