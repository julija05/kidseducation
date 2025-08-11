<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $locale) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url={{ $redirectUrl }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Switching Language...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .switch-container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .icon {
            font-size: 48px;
            margin-bottom: 20px;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-size: 18px;
            margin-bottom: 10px;
        }
        .sub-message {
            font-size: 14px;
            opacity: 0.8;
        }
        .fallback-link {
            margin-top: 20px;
        }
        .fallback-link a {
            color: white;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="switch-container">
        <div class="icon">🌐</div>
        <div class="message">Switching to {{ $localeNames[$locale] }}...</div>
        <div class="sub-message">Please wait while we refresh the page...</div>
        
        <div class="fallback-link">
            <a href="{{ $redirectUrl }}" id="fallback-link">Click here if not redirected automatically</a>
        </div>
    </div>
    
    <script>
        // Fallback JavaScript redirect
        setTimeout(function() {
            window.location.href = '{{ $redirectUrl }}';
        }, 1000);
        
        // Additional fallback for stubborn browsers
        setTimeout(function() {
            window.location.replace('{{ $redirectUrl }}');
        }, 2000);
        
        // Nuclear option - clear everything and reload
        setTimeout(function() {
            if (typeof Storage !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
            }
            window.location.href = '{{ $redirectUrl }}';
        }, 3000);
    </script>
</body>
</html>