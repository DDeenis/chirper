<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Chirp extends Model
{
    use HasFactory;

    protected $fillable = ['message'];
    protected $appends = ['user', 'likes_count', 'is_liked', 'media'];

    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'chirp_id');
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'chirps_media');
    }

    public static function create($chirp, User $user): Chirp
    {
        return $user->chirps()->create($chirp);
    }

    public function getUserAttribute()
    {
        return $this->user()->select(['id', 'name'])->first();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getIsLikedAttribute()
    {
        $userId = auth()->user()->id;
        return $this->likes()->where('user_id', '=', $userId)->exists();
    }

    public function getMediaAttribute()
    {
        return array_map(function (array $file) {
            // dd($file);
            return [
                'mime' => $file['mime_type'],
                'url' => Storage::url($file['path']),
            ];
        }, $this->media()->get()->toArray());
    }
}
