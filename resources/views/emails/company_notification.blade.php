<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Program Enrollment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #2c3e50;
        }
        p {
            font-size: 14px;
            color: #333;
        }
        .strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
    <h2>New Enrollment Notification</h2>
    @foreach ($student->programs as $program)
    <p><strong>Program:</strong> {{ $program->name }} (ID: {{ $program->id }})</p>
@endforeach
        <p><strong>Name:</strong> {{ $student->first_name }} {{ $student->last_name }}</p>
        <p><strong>Email:</strong> {{ $student->email }}</p>
        <p><strong>Phone:</strong> {{ $student->phone }}</p>
        <p><strong>Date of Birth:</strong> {{ $student->date_of_birth }}</p>
    </div>
</body>
</html>