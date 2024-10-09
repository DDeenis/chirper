<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function chirps(): HasMany
    {
        return $this->hasMany(Chirp::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    public function liked(int $chirp_id): bool
    {
        return Like::where([
            'user_id' => $this->id,
            'chirp_id' => $chirp_id
        ])->exists();
    }

    public function canLike(int $chirp_id): bool 
    {
        return !$this->liked($chirp_id);
    }

    public function like(int $chirp_id)
    {
        $this->likes()->create([
            'user_id' => $this->id,
            'chirp_id' => $chirp_id
        ]);
    }

    public function unlike(int $chirp_id)
    {
        $this->likes()
            ->where([
                'user_id' => $this->id,
                'chirp_id' => $chirp_id
            ])
            ->delete();
    }
}
