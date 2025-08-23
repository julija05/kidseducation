<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute полето мора да биде прифатено.',
    'accepted_if' => ':attribute полето мора да биде прифатено кога :other е :value.',
    'active_url' => ':attribute полето мора да биде валиден URL.',
    'after' => ':attribute полето мора да биде датум после :date.',
    'after_or_equal' => ':attribute полето мора да биде датум после или еднаков на :date.',
    'alpha' => ':attribute полето мора да содржи само букви.',
    'alpha_dash' => ':attribute полето мора да содржи само букви, бројки, цртички и долни црти.',
    'alpha_num' => ':attribute полето мора да содржи само букви и бројки.',
    'array' => ':attribute полето мора да биде низа.',
    'ascii' => ':attribute полето мора да содржи само еднобајтни алфанумерички карактери и симболи.',
    'before' => ':attribute полето мора да биде датум пред :date.',
    'before_or_equal' => ':attribute полето мора да биде датум пред или еднаков на :date.',
    'between' => [
        'array' => ':attribute полето мора да има помеѓу :min и :max ставки.',
        'file' => ':attribute полето мора да биде помеѓу :min и :max килобајти.',
        'numeric' => ':attribute полето мора да биде помеѓу :min и :max.',
        'string' => ':attribute полето мора да има помеѓу :min и :max карактери.',
    ],
    'boolean' => ':attribute полето мора да биде точно или неточно.',
    'can' => ':attribute полето содржи неовластена вредност.',
    'confirmed' => 'Потврдувањето на :attribute полето не се совпаѓа.',
    'contains' => ':attribute полето недостига потребна вредност.',
    'current_password' => 'Лозинката е неточна.',
    'date' => ':attribute полето мора да биде валиден датум.',
    'date_equals' => ':attribute полето мора да биде датум еднаков на :date.',
    'date_format' => ':attribute полето мора да се совпаѓа со форматот :format.',
    'decimal' => ':attribute полето мора да има :decimal децимални места.',
    'declined' => ':attribute полето мора да биде одбиено.',
    'declined_if' => ':attribute полето мора да биде одбиено кога :other е :value.',
    'different' => ':attribute полето и :other мораат да бидат различни.',
    'digits' => ':attribute полето мора да биде :digits цифри.',
    'digits_between' => ':attribute полето мора да биде помеѓу :min и :max цифри.',
    'dimensions' => ':attribute полето има неважечки димензии на сликата.',
    'distinct' => ':attribute полето има дуплирана вредност.',
    'doesnt_end_with' => ':attribute полето не смее да завршува со едно од следните: :values.',
    'doesnt_start_with' => ':attribute полето не смее да започнува со едно од следните: :values.',
    'email' => ':attribute полето мора да биде валидна е-mail адреса.',
    'ends_with' => ':attribute полето мора да завршува со едно од следните: :values.',
    'enum' => 'Избраната :attribute е неважечка.',
    'exists' => 'Избраната :attribute е неважечка.',
    'extensions' => ':attribute полето мора да има една од следните екстензии: :values.',
    'file' => ':attribute полето мора да биде датотека.',
    'filled' => ':attribute полето мора да има вредност.',
    'gt' => [
        'array' => ':attribute полето мора да има повеќе од :value ставки.',
        'file' => ':attribute полето мора да биде поголемо од :value килобајти.',
        'numeric' => ':attribute полето мора да биде поголемо од :value.',
        'string' => ':attribute полето мора да има повеќе од :value карактери.',
    ],
    'gte' => [
        'array' => ':attribute полето мора да има :value ставки или повеќе.',
        'file' => ':attribute полето мора да биде поголемо или еднакво на :value килобајти.',
        'numeric' => ':attribute полето мора да биде поголемо или еднакво на :value.',
        'string' => ':attribute полето мора да има :value карактери или повеќе.',
    ],
    'hex_color' => ':attribute полето мора да биде валидна хексадецимална боја.',
    'image' => ':attribute полето мора да биде слика.',
    'in' => 'Избраната :attribute е неважечка.',
    'in_array' => ':attribute полето не постои во :other.',
    'integer' => ':attribute полето мора да биде цел број.',
    'ip' => ':attribute полето мора да биде валидна IP адреса.',
    'ipv4' => ':attribute полето мора да биде валидна IPv4 адреса.',
    'ipv6' => ':attribute полето мора да биде валидна IPv6 адреса.',
    'json' => ':attribute полето мора да биде валиден JSON стринг.',
    'list' => ':attribute полето мора да биде листа.',
    'lowercase' => ':attribute полето мора да биде со мали букви.',
    'lt' => [
        'array' => ':attribute полето мора да има помалку од :value ставки.',
        'file' => ':attribute полето мора да биде помало од :value килобајти.',
        'numeric' => ':attribute полето мора да биде помало од :value.',
        'string' => ':attribute полето мора да има помалку од :value карактери.',
    ],
    'lte' => [
        'array' => ':attribute полето не смее да има повеќе од :value ставки.',
        'file' => ':attribute полето мора да биде помало или еднакво на :value килобајти.',
        'numeric' => ':attribute полето мора да биде помало или еднакво на :value.',
        'string' => ':attribute полето мора да има :value карактери или помалку.',
    ],
    'mac_address' => ':attribute полето мора да биде валидна MAC адреса.',
    'max' => [
        'array' => ':attribute полето не смее да има повеќе од :max ставки.',
        'file' => ':attribute полето не смее да биде поголемо од :max килобајти.',
        'numeric' => ':attribute полето не смее да биде поголемо од :max.',
        'string' => ':attribute полето не смее да има повеќе од :max карактери.',
    ],
    'max_digits' => ':attribute полето не смее да има повеќе од :max цифри.',
    'mimes' => ':attribute полето мора да биде датотека од тип: :values.',
    'mimetypes' => ':attribute полето мора да биде датотека од тип: :values.',
    'min' => [
        'array' => ':attribute полето мора да има најмалку :min ставки.',
        'file' => ':attribute полето мора да биде најмалку :min килобајти.',
        'numeric' => ':attribute полето мора да биде најмалку :min.',
        'string' => ':attribute полето мора да има најмалку :min карактери.',
    ],
    'min_digits' => ':attribute полето мора да има најмалку :min цифри.',
    'missing' => ':attribute полето мора да недостига.',
    'missing_if' => ':attribute полето мора да недостига кога :other е :value.',
    'missing_unless' => ':attribute полето мора да недостига освен ако :other е :value.',
    'missing_with' => ':attribute полето мора да недостига кога :values е присутно.',
    'missing_with_all' => ':attribute полето мора да недостига кога :values се присутни.',
    'multiple_of' => ':attribute полето мора да биде повеќекратник од :value.',
    'not_in' => 'Избраната :attribute е неважечка.',
    'not_regex' => ':attribute форматот на полето е неважечки.',
    'numeric' => ':attribute полето мора да биде број.',
    'password' => [
        'letters' => ':attribute полето мора да содржи најмалку една буква.',
        'mixed' => ':attribute полето мора да содржи најмалку една голема и една мала буква.',
        'numbers' => ':attribute полето мора да содржи најмалку еден број.',
        'symbols' => ':attribute полето мора да содржи најмалку еден симбол.',
        'uncompromised' => 'Дадената :attribute се појави во истекување на податоци. Ве молиме изберете друга :attribute.',
    ],
    'present' => ':attribute полето мора да биде присутно.',
    'present_if' => ':attribute полето мора да биде присутно кога :other е :value.',
    'present_unless' => ':attribute полето мора да биде присутно освен ако :other е :value.',
    'present_with' => ':attribute полето мора да биде присутно кога :values е присутно.',
    'present_with_all' => ':attribute полето мора да биде присутно кога :values се присутни.',
    'prohibited' => ':attribute полето е забрането.',
    'prohibited_if' => ':attribute полето е забрането кога :other е :value.',
    'prohibited_unless' => ':attribute полето е забрането освен ако :other е во :values.',
    'prohibits' => ':attribute полето го забранува :other да биде присутно.',
    'regex' => ':attribute форматот на полето е неважечки.',
    'required' => ':attribute полето е задолжително.',
    'required_array_keys' => ':attribute полето мора да содржи записи за: :values.',
    'required_if' => ':attribute полето е задолжително кога :other е :value.',
    'required_if_accepted' => ':attribute полето е задолжително кога :other е прифатено.',
    'required_if_declined' => ':attribute полето е задолжително кога :other е одбиено.',
    'required_unless' => ':attribute полето е задолжително освен ако :other е во :values.',
    'required_with' => ':attribute полето е задолжително кога :values е присутно.',
    'required_with_all' => ':attribute полето е задолжително кога :values се присутни.',
    'required_without' => ':attribute полето е задолжително кога :values не е присутно.',
    'required_without_all' => ':attribute полето е задолжително кога ниту еден од :values не се присутни.',
    'same' => ':attribute полето мора да се совпаѓа со :other.',
    'size' => [
        'array' => ':attribute полето мора да содржи :size ставки.',
        'file' => ':attribute полето мора да биде :size килобајти.',
        'numeric' => ':attribute полето мора да биде :size.',
        'string' => ':attribute полето мора да биде :size карактери.',
    ],
    'starts_with' => ':attribute полето мора да започнува со едно од следните: :values.',
    'string' => ':attribute полето мора да биде стринг.',
    'timezone' => ':attribute полето мора да биде валидна временска зона.',
    'unique' => ':attribute веќе е земено.',
    'uploaded' => ':attribute не успеа да се прикачи.',
    'uppercase' => ':attribute полето мора да биде со големи букви.',
    'url' => ':attribute полето мора да биде валиден URL.',
    'ulid' => ':attribute полето мора да биде валиден ULID.',
    'uuid' => ':attribute полето мора да биде валиден UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "rule.attribute" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [
        'first_name' => 'име',
        'last_name' => 'презиме',
        'email' => 'е-mail адреса',
        'password' => 'лозинка',
        'password_confirmation' => 'потврда на лозинка',
    ],

];
