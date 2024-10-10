<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateChirpRequest;
use App\Models\Chirp;
use App\Models\Media;
use App\Services\MediaService;
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

        $this->attachOrCreateImages($request, $created_chirp);

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

        $validated = $request->safe()->except(['images']);
        $chirp->update($validated);
        
        $this->attachOrCreateImages($request, $chirp);

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

    private function attachOrCreateImages(CreateChirpRequest $request, Chirp $chirp)
    {
        $images = $request->file('images');

        if($images && is_array($images)) {
            $imagesFolder = storage_path('app/public');
            $chirpExistingMediaHashes = array_map(fn ($media) => $media->file_hash, $chirp->media);

            $imageUploadData = collect($images)
                ->filter(fn (UploadedFile $file) => !in_array(MediaService::hashFile($file), $chirpExistingMediaHashes))
                ->map(function (UploadedFile $file) use ($imagesFolder)  {
                    $name = time().'_'.$file->hashName();
                    $path = $imagesFolder.'/'.$name;
                    $fileHash = MediaService::hashFile($file);
                    
                    $encodedImage = MediaService::encodeAndCompressImage($file);

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
                }
            );

            $separationResult = MediaService::separateUploadedFiles($imageUploadData);
            $filesToCreate = $separationResult['to_create'];
            $filesToAttach = $separationResult['to_atach'];
            $existingFilesIds = $separationResult['existing_ids'];

            if(count($filesToCreate) > 0) {
                $filesToCreate->each(fn (array $file) => $file['save']());
                $chirp
                    ->media()
                    ->createMany(
                        $filesToCreate->map(fn (array $file) => $file['file'])
                    );
            }
            
            if(count($filesToAttach) > 0) {
                $chirp
                    ->media()
                    ->attach($existingFilesIds);
            }

            return true;
        }

        return false;
    }
}
