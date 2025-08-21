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
        // Check if new fields exist in database
        $userTable = (new User)->getTable();
        $columns = \Schema::getColumnListing($userTable);

        $rules = [
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

        // Add new field validation only if columns exist
        if (in_array('first_name', $columns)) {
            $rules['first_name'] = ['required', 'string', 'max:255'];
        }

        if (in_array('last_name', $columns)) {
            $rules['last_name'] = ['required', 'string', 'max:255'];
        }

        if (in_array('address', $columns)) {
            $rules['address'] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }
}
