<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- SEO Meta Tags -->
    <meta name="description" content="Abacoding - Interactive educational platform for children. Learn mental arithmetic with abacus and coding with Scratch. Fun, engaging programs for young minds aged 4-12.">
    <meta name="keywords" content="abacus learning, mental arithmetic, coding for kids, scratch programming, children education, math skills, problem solving, creative thinking">
    <meta name="author" content="Abacoding">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#3B82F6">

    <!-- Open Graph Meta Tags -->

    <meta property="og:title" content="{{ config('app.name') }} - Interactive Learning Platform for Children">
    <meta property="og:description" content="Where children learn to think fast and build the future. Explore our magical world of learning with abacus and coding programs for curious and creative young minds.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ asset('build/assets/logo-Bd32rXV4.png') }}">
    <meta property="og:site_name" content="{{ config('app.name') }}">
    <meta property="og:locale" content="{{ app()->getLocale() }}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name') }} - Interactive Learning Platform for Children">
    <meta name="twitter:description" content="Where children learn to think fast and build the future. Educational programs for young minds.">
    <meta name="twitter:image" content="{{ asset('build/assets/logo-Bd32rXV4.png') }}">

    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Alternate Language Tags -->
    @if(Route::currentRouteName() && !str_contains(Route::currentRouteName(), 'admin.'))
    <link rel="alternate" hreflang="en" href="{{ url()->current() }}?lang=en">
    <link rel="alternate" hreflang="mk" href="{{ url()->current() }}?lang=mk">
    <link rel="alternate" hreflang="x-default" href="{{ url()->current() }}">
    @endif

    <title inertia>{{ config('app.name', 'Abacoding') }}</title>

    <!-- Favicons -->
    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">

    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>

    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//fonts.bunny.net">
    <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">

    <!-- Fonts -->
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <!-- Structured Data -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "{{ config('app.name') }}",
            "description": "Interactive educational platform for children specializing in mental arithmetic and coding education",
            "url": "{{ url('/') }}",
            "logo": "{{ asset('build/assets/logo-Bd32rXV4.png') }}",
            "sameAs": [],
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "MK"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "contact@abacoding.com"
            },
            "offers": [{
                    "@type": "Course",
                    "name": "Mental Arithmetic Mastery",
                    "description": "Develop exceptional calculation speed and accuracy using abacus techniques",
                    "courseMode": "online",
                    "educationalLevel": "Beginner"
                },
                {
                    "@type": "Course",
                    "name": "Coding for Kids (Scratch)",
                    "description": "Introduction to programming through fun and interactive Scratch programming",
                    "courseMode": "online",
                    "educationalLevel": "Beginner"
                }
            ]
        }
    </script>

    <!-- Google Tag Manager -->
    @if(env('GOOGLE_TAG_MANAGER_ID'))
    <script>
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', '{!! env("GOOGLE_TAG_MANAGER_ID") !!}');
    </script>
    @endif


    <!-- Google Analytics 4 (if GA ID is provided separately) -->
    @if(env('GOOGLE_ANALYTICS_ID') && !env('GOOGLE_TAG_MANAGER_ID'))
    <script async src="https://www.googletagmanager.com/gtag/js?id={!! env('GOOGLE_ANALYTICS_ID') !!}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', '{!! env("GOOGLE_ANALYTICS_ID") !!}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
        });
    </script>
    @endif

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>

<body class="font-sans antialiased">
    <!-- Google Tag Manager (noscript) -->
    @if(env('GOOGLE_TAG_MANAGER_ID'))
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ env('GOOGLE_TAG_MANAGER_ID') }}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    @endif

    @inertia
</body>

</html>