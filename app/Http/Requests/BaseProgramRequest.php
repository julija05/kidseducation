<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class BaseProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get shared validation rules
     */
    protected function getSharedRules(): array
    {
        return [
            'name' => 'string|max:255',
            'description' => 'string',
            'duration' => 'string|max:255',
            'price' => 'numeric|min:0',
            'icon' => 'string|max:255',
            'color' => 'string|max:255',
            'light_color' => 'string|max:255',
            'border_color' => 'string|max:255',
            'text_color' => 'string|max:255',
            '_method' => 'sometimes|string'
        ];
    }

    /**
     * Get shared error messages
     */
    protected function getSharedMessages(): array
    {
        return [
            'name.required' => 'The program name is required.',
            'name.string' => 'The program name must be text.',
            'name.max' => 'The program name cannot exceed 255 characters.',

            'description.required' => 'The program description is required.',
            'description.string' => 'The program description must be text.',

            'duration.required' => 'The program duration is required.',
            'duration.string' => 'The program duration must be text.',
            'duration.max' => 'The program duration cannot exceed 255 characters.',

            'price.required' => 'The program price is required.',
            'price.numeric' => 'The program price must be a valid number.',
            'price.min' => 'The program price must be at least 0.',

            'icon.string' => 'The program icon must be text.',
            'icon.max' => 'The program icon cannot exceed 255 characters.',

            'color.string' => 'The program color must be text.',
            'color.max' => 'The program color cannot exceed 255 characters.',
        ];
    }
}
