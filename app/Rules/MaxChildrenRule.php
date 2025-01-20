<?php

namespace App\Rules;

use App\Models\AdultFamilyMember;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxChildrenRule implements ValidationRule
{
    
    protected $adultFamilyMemberId;

    public function __construct($adultFamilyMemberId)
    {
        $this->adultFamilyMemberId = $adultFamilyMemberId;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $adultFamilyMember = AdultFamilyMember::withCount('children')
            ->find($this->adultFamilyMemberId);

        if (!$adultFamilyMember || $adultFamilyMember->children_count >= 3) {
            $fail('A parent cannot have more than 3 children.');
        }
    }
}
