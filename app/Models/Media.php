<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Media extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'file_name', 'mime_type', 'path', 'disk', 'file_hash', 'collection', 'size'];

    public function chirps(): BelongsToMany
    {
        return $this->belongsToMany(Chirp::class, 'chirps_media');
    }
}
