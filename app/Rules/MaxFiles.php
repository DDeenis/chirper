<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MaxFiles implements ValidationRule
{
    public function __construct(
        public int $max
    ) {}

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if(is_array($value) && count($value) > $this->max) {
            $fail("Maximum files count should be no more than {$this->max}");
        }
    }
}
