<?php

namespace App\Http\Requests\Mentor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mentor') === true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'meeting_type' => ['required', Rule::in(['individual', 'group'])],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:480'],
            'meeting_url' => ['nullable', 'url', 'max:500'],
            'location' => ['nullable', 'string', 'max:191'],
            'learning_group_id' => [
                Rule::requiredIf(fn () => $this->input('meeting_type') === 'group'),
                'nullable',
                'integer',
                'exists:learning_groups,id',
            ],
            'student_ids' => [
                Rule::requiredIf(fn () => $this->input('meeting_type') === 'individual'),
                'array',
                'max:1',
            ],
            'student_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
