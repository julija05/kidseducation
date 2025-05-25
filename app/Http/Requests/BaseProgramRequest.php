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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
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

            'image.image' => 'The uploaded file must be an image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, svg.',
            'image.max' => 'The image size cannot exceed 2MB.',
        ];
    }
}
