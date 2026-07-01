<?php

namespace App\Http\Requests\Mentor;

use App\Models\LiveSessionAttendance;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLiveSessionAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attendance' => ['required', 'array', 'min:1'],
            'attendance.*.student_id' => ['required', 'integer', 'distinct', 'exists:users,id'],
            'attendance.*.status' => ['required', 'string', Rule::in(LiveSessionAttendance::STATUSES)],
        ];
    }
}
