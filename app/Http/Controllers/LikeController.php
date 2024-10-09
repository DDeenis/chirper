<?php

namespace App\Http\Controllers;

use App\Http\Requests\DestroyLikeRequest;
use App\Models\Chirp;
use App\Models\Like;
use App\Http\Requests\StoreLikeRequest;
use Gate;
use Illuminate\Http\RedirectResponse;
use Request;

class LikeController extends Controller
{

    public function toggle(Chirp $chirp): RedirectResponse
    {
        $user = auth()->user();

        if($user->liked($chirp->id)) {
            $user->unlike($chirp->id);
            return redirect()->back();
        }
        else if($user->canLike($chirp->id)) {
            $user->like($chirp->id);
            return redirect()->back();
        }

        abort(403, 'Forbidden');
    }
}
