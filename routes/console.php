<?php

use App\Services\MediaService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// cleanup files from deleted chirps
Schedule::call(fn () => MediaService::cleanupDeletedChirpsMedia())->dailyAt('00:00');
