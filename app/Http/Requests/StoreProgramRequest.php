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
        $rules['name'] = 'required|'.$rules['name'];
        $rules['description'] = 'required|'.$rules['description'];
        $rules['duration'] = 'required|'.$rules['duration'];
        $rules['price'] = 'required|'.$rules['price'];

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
        // Handle checkbox fields - if not present, set to false
        $data = $this->all();
        if (! array_key_exists('requires_monthly_payment', $data)) {
            $data['requires_monthly_payment'] = false;
        }
        // Unchecked checkboxes are omitted by the browser; default to false.
        if (! array_key_exists('has_mental_accelerator', $data)) {
            $data['has_mental_accelerator'] = false;
        }
        $this->replace($data);
    }
}
