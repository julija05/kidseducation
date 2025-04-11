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
        <h2>New Program Enrollment</h2>

        <p><span class="strong">Program ID:</span> {{ $student->program_id }}</p>
        <p><span class="strong">Child's Name:</span> {{ $student->child_name }} {{ $student->child_surname }}</p>
        <p><span class="strong">Age:</span> {{ $student->child_age }}</p>
        <p><span class="strong">Address:</span> {{ $student->address }}</p>
    </div>
</body>
</html>