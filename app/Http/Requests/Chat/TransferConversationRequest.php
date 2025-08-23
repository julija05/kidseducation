<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class TransferConversationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in middleware and controller
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'admin_id' => 'required|exists:users,id',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'admin_id.required' => 'Target admin is required.',
            'admin_id.exists' => 'Selected admin does not exist.',
        ];
    }
}
