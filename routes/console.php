<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// cleanup files from deleted chirps
Schedule::call(function () {
    $deletedFiles = DB::table('media')
        ->select('media.*')
        ->leftJoin('chirps_media', 'media.id', '=', 'chirps_media.media_id')
        ->whereNull('chirps_media.chirp_id')
        ->get();

    $processedIds = [];
    $idsToDelete = [];

    foreach($deletedFiles as $file) {
        if(!in_array($file->id, $processedIds)) {
            $countExisting = DB::table('chirps_media')->where('media_id', '=', $file->id)->count();
            $countDeleted = $deletedFiles->reduce(
                function ($carry, $item) use ($file) {
                    return $item->id === $file->id ? $carry + 1 : $carry;
                },
                0
            );
            $isSafeToDelete = $countExisting === $countDeleted;

            if($isSafeToDelete) {
                // Storage::delete($file->path);
                unlink(public_path('storage/'.$file->name));
                $idsToDelete[] = $file->id;
            }

            $processedIds[] = $file->id;
        }
    }

    DB::table('media')->whereIn('id', $idsToDelete)->delete();
    DB::table('chirps_media')->whereNull('chirp_id')->delete();
})->dailyAt('00:00');
