<?php

$repoDir = '/home/abacygmx/repositories/kidseducation';
$buildZip = "$repoDir/prod/public.zip";
$buildDir = "$repoDir/public";
$deployDestination = '/home/abacygmx/public_html';
$preserveFile = 'webhook.php';
$customIndexSource = "$repoDir/prod/index.php";
$deployIndexPath = "$deployDestination/index.php";

$secret = 'SrdglkkjdsnrgiuoserhgoihklNDH)O*DSF(ESF'; // GitHub Webhook secret (optional)

$payload = file_get_contents('php://input');
$headers = getallheaders();

if ($secret != '' && isset($headers['X-Hub-Signature-256'])) {
    $hash = 'sha256=' . hash_hmac('sha256', $secret, $payload, false);
    if (!hash_equals($headers['X-Hub-Signature-256'], $hash)) {
        http_response_code(403);
        die('Invalid signature');
    }
}

$data = json_decode($payload, true);

chdir($repoDir);

// Git stash
exec('git stash 2>&1', $output, $result);
if ($result !== 0) {
    error_log("Git stash failed:\n" . implode("\n", $output));
    http_response_code(500);
    die("Git stash failed:\n" . implode("\n", $output));
}

// Git pull
exec('git pull 2>&1', $output, $result);
if ($result !== 0) {
    error_log("Git pull failed:\n" . implode("\n", $output));
    http_response_code(500);
    die("Git pull failed:\n" . implode("\n", $output));
}

// Run composer update
exec('composer update 2>&1', $outputComposer, $returnComposer);
if ($returnComposer !== 0) {
    echo "Composer Update Failed:\n";
    echo implode("\n", $outputComposer);
    echo "\nReturn Code: $returnComposer\n";
}

// Run Laravel migrations
exec('php artisan migrate --force 2>&1', $outputMigrate, $returnMigrate);
if ($returnMigrate !== 0) {
    echo "Migration Failed:\n";
    echo implode("\n", $outputMigrate);
    echo "\nReturn Code: $returnMigrate\n";
}

// Check seeding condition
exec('php artisan tinker --execute="echo App\Models\Program::count();" 2>&1', $programCountOutput, $programCountResult);
$programCount = isset($programCountOutput[0]) ? intval(trim($programCountOutput[0])) : 0;

$shouldSeed = false;

if ($programCount === 0) {
    echo "No programs found, seeding database...\n";
    $shouldSeed = true;
} else {
    if (isset($data['commits'])) {
        foreach ($data['commits'] as $commit) {
            if (isset($commit['modified']) || isset($commit['added'])) {
                $allFiles = array_merge(
                    $commit['modified'] ?? [],
                    $commit['added'] ?? []
                );

                foreach ($allFiles as $file) {
                    if (strpos($file, 'database/seeders/') === 0 || strpos($file, 'database/migrations/') === 0) {
                        echo "Seeder/migration files modified, re-seeding database...\n";
                        $shouldSeed = true;
                        break 2;
                    }
                }
            }
        }
    }
}

if ($shouldSeed) {
    exec('php artisan db:seed --force 2>&1', $outputSeed, $returnSeed);
    if ($returnSeed !== 0) {
        echo "Seeding Failed:\n";
        echo implode("\n", $outputSeed);
        echo "\nReturn Code: $returnSeed\n";
    } else {
        echo "Database seeding completed successfully.\n";
    }
} else {
    echo "Skipping database seeding - no changes needed.\n";
}

// Clear Laravel cache
exec('php artisan optimize:clear 2>&1', $outputClear, $returnClear);

// ---- DEPLOY FILES ----

// Clear destination except webhook.php
exec("find {$deployDestination} -mindepth 1 ! -name {$preserveFile} -exec rm -rf {} +");

$zip = new ZipArchive;
$extractTo = $repoDir;

if ($zip->open($buildZip) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
} else {
    echo "Failed to open the ZIP file.";
}

// Copy build to destination
exec("cp -r {$buildDir}/* {$deployDestination}/");
exec("cp -f {$repoDir}/webhook.php* {$deployDestination}/webhook.php");
copy($customIndexSource, $deployIndexPath);
copy($buildDir . "/.htaccess", $deployDestination . "/.htaccess");
@unlink($deployDestination . "/hot");
@unlink($repoDir . "/public/hot");

echo "Deployment completed successfully.\n";

// ---- STORAGE MOVE & SYMLINK ----

$appPublic = "$repoDir/storage/app/public";
$webStorage = "$deployDestination/storage";

if (is_link($webStorage)) {
    unlink($webStorage);
}

// Ensure public_html/storage exists
if (!is_dir($webStorage)) {
    mkdir($webStorage, 0775, true);
}

// Move all files from app/public → public_html/storage
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($appPublic, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST
);

foreach ($iterator as $item) {
    $targetPath = $webStorage . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
    if ($item->isDir()) {
        if (!is_dir($targetPath)) {
            mkdir($targetPath, 0775, true);
        }
    } else {
        copy($item, $targetPath);
    }
}

// Delete old app/public folder
if (is_dir($appPublic)) {
    exec("rm -rf " . escapeshellarg($appPublic));
}

// Create symlink: app/public -> public_html/storage
if (!is_link($appPublic)) {
    if (@symlink($webStorage, $appPublic)) {
        echo "Symlink created: $appPublic -> $webStorage\n";
    } else {
        echo "Symlink creation failed. Files are still available in $webStorage\n";
    }
}

echo "Storage move & symlink step completed.\n";
