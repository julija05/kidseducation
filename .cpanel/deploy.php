<?php
$username = 'abacygmx';
$deployPath = '/home/' . $username . '/public_html/';
$appPath = '/home/' . $username . '/repositories/kidseducation/';

// Copy public files
shell_exec("/bin/cp -R {$appPath}public/* {$deployPath}");

// Copy application files one directory up from public_html
$appDestination = dirname($deployPath);
shell_exec("/bin/cp -R {$appPath}app {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}bootstrap {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}config {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}database {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}resources {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}routes {$appDestination}/");
shell_exec("/bin/cp -R {$appPath}storage {$appDestination}/");
shell_exec("/bin/cp {$appPath}.env {$appDestination}/");
shell_exec("/bin/cp {$appPath}artisan {$appDestination}/");
shell_exec("/bin/cp {$appPath}composer.json {$appDestination}/");
shell_exec("/bin/cp {$appPath}composer.lock {$appDestination}/");

// Run necessary commands
chdir($appDestination);
shell_exec("/usr/local/bin/php /opt/cpanel/composer/bin/composer install --no-dev");
shell_exec("/usr/local/bin/php artisan migrate --force");
shell_exec("/usr/local/bin/php artisan cache:clear");
shell_exec("/usr/local/bin/php artisan config:clear");
shell_exec("/usr/local/bin/php artisan view:clear");
shell_exec("/usr/local/bin/php artisan route:clear");
shell_exec("/usr/local/bin/npm install");
shell_exec("/usr/local/bin/npm run build");

echo "Deployment completed.\n";
