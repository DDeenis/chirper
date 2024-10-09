<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateChirpRequest;
use App\Models\Chirp;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Encoders\AutoEncoder;
use Intervention\Image\Laravel\Facades\Image;
use Storage;

class ChirpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Chirp/Index', [
            'chirps' => Chirp::latest()->cursorPaginate(20),
            'created_chirp' => fn() => $request->session()->get('created_chirp')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateChirpRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->safe()->except(['images']);
        $created_chirp = Chirp::create($validated, $user);

        $images = $request->file('images');

        if($images && is_array($images)) {
            $imagesFolder = storage_path('app/public');

            if(!is_dir($imagesFolder)) mkdir(directory: $imagesFolder, recursive: true);

            $imageUploadData = array_map(function (UploadedFile $file) use ($imagesFolder)  {
                    $name = time().'_'.$file->hashName();
                    $path = $imagesFolder.'/'.$name;
                    $fileHash = hash_file(
                        config(key: 'app.uploads.hash_algo'),
                        $file,
                    );
                    
                    // $image = Image::read($file)->encode(new AutoEncoder(quality: 70));
                    $image = Image::read($file);

                    if($image->width() > 1920 || $image->height() > 1080) {
                        $image->scaleDown(1920, 1080);
                    }

                    $encodedImage = $image->encode(new AutoEncoder(quality: 70));

                    return [
                        'file' => [
                            'name' => $name,
                            'file_name' => $file->getClientOriginalName(),
                            'mime_type' => $encodedImage->mediaType(),
                            // 'path' => $path,
                            'path' => "public/{$name}",
                            'disk' => config('app.uploads.disk'),
                            'file_hash' => $fileHash,
                            'collection' => null,
                            'size' => $encodedImage->size(),
                        ],
                        'save' => fn () => $encodedImage->save($path),
                    ];
            }, $images);

            $existingFiles = Media::whereIn(
                'file_hash', 
                array_map(
                    fn ($file) => $file['file']['file_hash'],
                    $imageUploadData
                )
            )->select(['id', 'file_hash'])->get();

            $existingFilesHashes = $existingFiles->pluck('file_hash')->toArray();
            $existingFilesIds = $existingFiles->pluck('id')->toArray();

            $filesToAttach = array_filter(
                $imageUploadData, 
                fn ($file) => in_array($file['file']['file_hash'], $existingFilesHashes)
            );
            $filesToCreate = array_filter(
                $imageUploadData, 
                fn ($file) => !in_array($file['file']['file_hash'], $existingFilesHashes)
            );

            // dd($existingFiles, array_map(
            //     fn ($file) => $file['file_hash'],
            //     $imageUploadData
            // ), Media::all());

            if(count($filesToCreate) > 0) {
                foreach($filesToCreate as $file) {
                    $saveFileFn = $file['save'];
                    $saveFileFn();
                }

                $created_chirp
                    ->media()
                    ->createMany(
                        array_map(
                            fn (array $file) => $file['file'],
                            $filesToCreate
                        )
                    );
            }
            
            if(count($filesToAttach) > 0) {
                $created_chirp
                    ->media()
                    ->attach($existingFilesIds);
            }
        }

        return redirect()->back()->with([
            'created_chirp' => $created_chirp
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateChirpRequest $request, Chirp $chirp): RedirectResponse
    {
        Gate::authorize('update', $chirp);

        $validated = $request->validated();
        $chirp->update($validated);

        return redirect(route('chirps.index'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chirp $chirp): RedirectResponse
    {
        Gate::authorize('delete', $chirp);

        $chirp->delete();

        return redirect(route('chirps.index'));
    }
}
