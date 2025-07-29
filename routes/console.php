<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule lesson reminders to be checked every hour
Schedule::command('lessons:send-reminders')
    ->hourly()
    ->description('Send reminder emails for upcoming lessons')
    ->runInBackground();
