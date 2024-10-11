<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChirpRequest;
use App\Models\Chirp;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(User $user, Request $request): Response
    {
        // $viewed_user = User::with('chirps')->where('id', $user->id)->first(['id', 'name']);
        return Inertia::render('User/Index', [
            'viewedUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'created_at' => $user->created_at
            ],
            'chirps' => $user->chirps()->latest()->cursorPaginate(10),
            'created_chirp' => fn() => $request->session()->get('created_chirp')
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function create_chirp(StoreChirpRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $created_chirp = Chirp::create($validated, $user);

        return redirect(route('user.index', [$user]))->with([
            'created_chirp' => $created_chirp
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}
