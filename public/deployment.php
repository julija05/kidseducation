<?php

// Your secret key for verification
$secret = 'webhook password'; // you will use this when creating a webhook

// Get the payload from GitHub
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE'];

// Verify the payload signature
list($algo, $hash) = explode('=', $signature, 2);
if ($hash !== hash_hmac($algo, $payload, $secret)) {
    header('HTTP/1.1 403 Forbidden');
    exit;
}


// Define the project root directory
$projectRoot = '/home/servername/projectdirectory';

// Pull the latest changes from the repository
$output = shell_exec("cd $projectRoot && git pull 2>&1");
echo "<pre>Git Pull Output:\n$output</pre>";

// Run composer install
$output = shell_exec("cd $projectRoot && composer install --no-interaction --prefer-dist --optimize-autoloader 2>&1");
echo "<pre>Composer Install Output:\n$output</pre>";

// Run artisan commands
$output = shell_exec("cd $projectRoot && php artisan optimize:clear 2>&1");
echo "<pre>Artisan Output:\n$output</pre>";

$output = shell_exec("cd $projectRoot && php artisan optimize 2>&1");
echo "<pre>Artisan Output:\n$output</pre>";

$output = shell_exec("cd $projectRoot && php artisan migrate 2>&1");
echo "<pre>Artisan Output:\n$output</pre>";

$output = shell_exec("cd $projectRoot && php artisan storage:link 2>&1");
echo "<pre>Artisan Output:\n$output</pre>";

?>