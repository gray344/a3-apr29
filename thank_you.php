<?php
  // thank_you.php
  session_start();
  // (You can clear any session errors here if you like)
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You!</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Thank You!</h1>
    </header>

    <div id="successMessage">
        <p>Your complaint has been successfully submitted. We appreciate you taking the time to let us know.</p>
        <p>One of our team members will review it and get back to you shortly.</p>
    </div>

    <div class="member-container">
        <a href="index.php">
            <button type="button">Submit Another Complaint</button>
        </a>
    </div>
</body>
</html>
