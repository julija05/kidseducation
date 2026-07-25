<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePracticeRunRequest extends FormRequest
{
    // The operation modes a run may report, mirroring the client-side generator.
    private const OPERATIONS = ['addition', 'subtraction', 'mixed'];

    // Number size is measured in digits (1..10) by the practice tool.
    private const MIN_DIGITS = 1;

    private const MAX_DIGITS = 10;

    // Upper bound on rounds a single run can contain, guarding against bad input.
    private const MAX_ROUNDS = 50;

    /**
     * The route is already restricted to authenticated students; a student may
     * always record their own practice run.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Validation rules for a submitted practice-run summary.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'operation' => ['required', Rule::in(self::OPERATIONS)],
            'min_digits' => ['required', 'integer', 'between:'.self::MIN_DIGITS.','.self::MAX_DIGITS],
            'max_digits' => ['required', 'integer', 'gte:min_digits', 'between:'.self::MIN_DIGITS.','.self::MAX_DIGITS],
            'display_time' => ['required', 'numeric', 'between:0.1,10'],
            'numbers_per_round' => ['required', 'integer', 'between:1,20'],
            'total_rounds' => ['required', 'integer', 'between:1,'.self::MAX_ROUNDS],
            // A student can never get more rounds right than they played.
            'correct_rounds' => ['required', 'integer', 'between:0,'.self::MAX_ROUNDS, 'lte:total_rounds'],
        ];
    }
}
