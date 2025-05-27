<?php

namespace App\Http\Requests;

class StoreProgramRequest extends BaseProgramRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->getSharedRules();

        // Make fields required for creation
        $rules['name'] = 'required|' . $rules['name'];
        $rules['description'] = 'required|' . $rules['description'];
        $rules['duration'] = 'required|' . $rules['duration'];
        $rules['price'] = 'required|' . $rules['price'];

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
}
