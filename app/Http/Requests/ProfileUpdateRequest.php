<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'language_preference' => ['nullable', 'string', 'in:en,mk'],
            'language_selected' => ['nullable', 'boolean'],
            'theme_preference' => ['nullable', 'string', 'in:default,purple,green,orange,teal,dark'],
            'avatar_path' => ['nullable', 'string', 'max:255'],
            'avatar_type' => ['nullable', 'string', 'in:initial,emoji'],
            'avatar_value' => ['nullable', 'string', 'max:10'],
        ];
    }
}
