<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #E74C3C;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }

        .info-box {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #E74C3C;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #E74C3C;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>New Enrollment Request</h1>
        </div>
        <div class="content">
            <p>A new enrollment request has been submitted and requires your review.</p>

            <div class="info-box">
                <h3>Student Information:</h3>
                <p><strong>Name:</strong> {{ $user->name }}<br>
                    <strong>Email:</strong> {{ $user->email }}<br>
                    <strong>Program:</strong> {{ $program->name }}<br>
                    <strong>Program Price:</strong> ${{ $program->price }}<br>
                    <strong>Requested at:</strong> {{ $enrollment->created_at->format('F j, Y at g:i A') }}
                </p>
            </div>

            <a href="{{ url('/admin/enrollments/pending') }}" class="button">Review Enrollment Request</a>

            <p>Please review this enrollment request at your earliest convenience.</p>
        </div>
    </div>
</body>

</html>