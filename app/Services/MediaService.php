<?php

namespace App\Services;
use DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Intervention\Image\Encoders\AutoEncoder;
use Intervention\Image\Laravel\Facades\Image;

class MediaService {
    public static function hashFile(UploadedFile $file)
    {
        return hash_file(
            config(key: 'app.uploads.hash_algo'),
            $file,
        );
    }

    public static function encodeAndCompressImage(UploadedFile $file)
    {
        $image = Image::read($file);

        if($image->width() > 1920 || $image->height() > 1080) {
            $image->scaleDown(1920, 1080);
        }

        $encodedImage = $image->encode(new AutoEncoder(quality: 70));
        return $encodedImage;
    }

    public static function isFileExist(UploadedFile $file)
    {
        return DB::table('media')
            ->where(
                'file_hash', 
                '=', 
                MediaService::hashFile($file)
            )
            ->exists();
    }

    public static function separateUploadedFiles(Collection $uploadedFilesCollection)
    {
        $existingFiles = DB::table('media')
            ->whereIn(
                'file_hash', 
                $uploadedFilesCollection->map(
                    fn ($file) => $file['file']['file_hash'],
                )
            )
            ->select(['id', 'file_hash'])->get();

        $existingFilesHashes = $existingFiles->pluck('file_hash')->toArray();
        $existingFilesIds = $existingFiles->pluck('id')->toArray();

        $filesToAttach = $uploadedFilesCollection->filter(
            fn ($file) => in_array($file['file']['file_hash'], $existingFilesHashes)
        );
        $filesToCreate = $uploadedFilesCollection->filter(
            fn ($file) => !in_array($file['file']['file_hash'], $existingFilesHashes)
        );

        return [
            'to_create' => $filesToCreate, 
            'to_atach' => $filesToAttach,
            'existing_ids' => $existingFilesIds
        ];
    }

    public static function cleanupDeletedChirpsMedia() 
    {
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
                    function (int $carry, $item) use ($file) {
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
    }
}