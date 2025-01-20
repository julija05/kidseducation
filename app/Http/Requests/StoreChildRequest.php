<?php

namespace App\Http\Requests;

use App\Rules\MaxChildrenRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChildRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'dob' => 'required|date',
            'adult_family_member_id' => [
                'required',
                'exists:adult_family_members,id',
                new MaxChildrenRule($this->input('adult_family_member_id')), // Pass the parent ID to the rule
            ],
        ];       
    }
}
