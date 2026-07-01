<?php

namespace App\Http\Requests\Mentor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMeetingAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mentor') === true;
    }

    public function rules(): array
    {
        return [
            'attendance' => ['required', 'array', 'min:1'],
            'attendance.*.participant_id' => ['required', 'integer', 'distinct', 'exists:meeting_participants,id'],
            'attendance.*.status' => ['required', Rule::in(['attended', 'missed'])],
        ];
    }
}
