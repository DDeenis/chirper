<?php

namespace App\Http\Requests;

use App\Rules\MaxFiles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class StoreChirpRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:255'],
            'images' => ['array', 'distinct', new MaxFiles(max: 4)],
            'images.*' => [File::types(['jpg', 'jpeg', 'png', 'webp'])->max(5 * 1024)],
        ];
    }
}
