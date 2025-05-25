<?php

namespace App\Http\Requests;

class UpdateProgramRequest extends BaseProgramRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->getSharedRules();

        // Make fields conditional for updates
        $rules['name'] = 'sometimes|required|' . $rules['name'];
        $rules['description'] = 'sometimes|required|' . $rules['description'];
        $rules['duration'] = 'sometimes|required|' . $rules['duration'];
        $rules['price'] = 'sometimes|required|' . $rules['price'];
        $rules['image'] = 'sometimes|' . $rules['image'];

        return $rules;
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->getSharedMessages();
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Remove empty string values to allow partial updates
        $filtered = collect($this->all())
            ->filter(function ($value, $key) {
                // Keep _method field as is
                if ($key === '_method') {
                    return true;
                }
                // For image field, keep it if it's a file or null, remove if empty string
                if ($key === 'image') {
                    return $value !== '' || $value === null;
                }
                // Filter out empty strings but keep 0 values for other fields
                return $value !== '' && $value !== null;
            })
            ->toArray();

        // If image key exists but is null or empty, remove it completely
        if (array_key_exists('image', $filtered) && empty($filtered['image'])) {
            unset($filtered['image']);
        }

        $this->replace($filtered);
    }
}
