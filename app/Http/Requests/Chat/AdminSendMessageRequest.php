<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class AdminSendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'conversation_id' => 'required|exists:chat_conversations,id',
            'message' => 'required|string|max:1000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'conversation_id.required' => 'Chat conversation is required.',
            'conversation_id.exists' => 'Invalid chat conversation.',
            'message.required' => 'Message cannot be empty.',
            'message.max' => 'Message cannot exceed 1000 characters.',
        ];
    }
}
