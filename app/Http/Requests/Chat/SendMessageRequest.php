<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'conversation_id' => 'required|exists:chat_conversations,id',
            'message' => 'required|string|max:1000',
            'visitor_name' => 'nullable|string|max:255',
            'visitor_email' => 'nullable|email|max:255',
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
            'visitor_name.max' => 'Name cannot exceed 255 characters.',
            'visitor_email.email' => 'Please provide a valid email address.',
            'visitor_email.max' => 'Email cannot exceed 255 characters.',
        ];
    }
}
