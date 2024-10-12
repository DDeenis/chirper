<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChirpRequest;
use App\Http\Requests\UpdateChirpRequest;
use App\Models\Chirp;
use App\Models\Media;
use App\Services\MediaService;
use DB;
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
            'created_chirp' => fn() => $request->session()->get('created_chirp'),
            'updated_chirp' => fn() => $request->session()->get('updated_chirp'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChirpRequest $request): RedirectResponse
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
    public function _update(UpdateChirpRequest $request, Chirp $chirp): RedirectResponse
    {
        Gate::authorize('update', $chirp);

        $validated = $request->safe()->only(['message']);

        $chirp->update($validated);
        
        $this->deleteRemovedImages($request, $chirp);
        $this->attachOrCreateImages($request, $chirp);

        $chirp->refresh();

        return redirect()->back()->with('updated_chirp', $chirp);
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

    private function attachOrCreateImages(StoreChirpRequest|UpdateChirpRequest $request, Chirp $chirp)
    {
        $images = $request->file('images');

        if($images && is_array($images)) {
            $imagesFolder = storage_path('app/public');

            $imageUploadData = collect($images)
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
                $chirp
                    ->media()
                    ->createMany(
                        $filesToCreate->map(fn (array $file) => $file['file'])
                    );
                $filesToCreate->each(fn (array $file) => $file['save']());
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

    private function deleteRemovedImages(UpdateChirpRequest $request, Chirp $chirp)
    {
        $removedImagesIds = $request->input('deleted_images_ids');
        
        if(is_array($removedImagesIds)) {
            $chirp->media()->detach($removedImagesIds);
            return true;
        }

        return false;
    }
}
