<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Image Storage Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration determines how images are stored and managed
    | throughout the application.
    |
    */

    'disk' => env('IMAGE_DISK', 'public'),

    'directories' => [
        'programs' => 'program_images',
        'news' => 'news_images',
        'users' => 'user_avatars',
    ],

    'validation' => [
        'max_size' => 2048, // 2MB in kilobytes
        'allowed_types' => ['jpeg', 'png', 'jpg', 'gif', 'svg'],
    ],

    'defaults' => [
        'program' => 'default-program.svg',
        'news' => 'default-news.svg',
        'user' => 'default-avatar.svg',
    ],
];
