<?php session_start(); ?>
<!DOCTYPE html>
<html>
<head>
    <title>IE332 Group 7</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>

<body>

    <!-- IE332 Group 7 header at top of login page -->
    <header>
    <div>
        <h1 id="welcomeText"></h1>
    </div>
    </header>

    <div>
        <!-- Group Member Image Placeholders -->
        <div class="member-container">
            <div class="member">
                <div class="image-box"></div>
                <div>Lance Kim</div>
            </div>
            <div class="member">
                <div class="image-box"></div>
                <div>Jackson Gray</div>
            </div>
            <div class="member">
                <img src="pictures/Cover PIc.jpg" class="image-box">
                <div>Suchir Peyyeti</div>
            </div>
            <div class="member">
                <div class="image-box"></div>
                <div>Jino Nicolas</div>
            </div>
            <div class="member">
                <div class="image-box"></div>
                <div>Aryan Deshpande</div>
            </div>
        </div>

        <div class="container">
            <div class="left-section">
                <form action="login_auth.php" method="POST" class="form-container">
                    <input type="text" name="username" placeholder="Username" required />
                    <div class="password-container" style="position: relative; display: flex; align-items: center;">
                    <input type="password" name="password" id="passwordField" placeholder="Password" required style="flex: 1; padding-right: 90px;" />
                    
                    <div class="toggle-password-wrapper" style="position: absolute; right: 0px; top: 50%; transform: translateY(-50%);">
                        <button type="button" id="togglePassword" class="toggle-password-btn">Show</button> 
                        <!-- ONLY the button gets class="toggle-password-btn" -->
                    </div>
            </div>


                    <button type="submit" id="loginButton">
                    <span id="loginButtonText">Login</span></button>

                    </form>

                <form action="empty_database.php" method="POST" class="form-container" style="margin-top:10px;">
                    <button type="submit">Empty Database</button>
                </form>

                <form action="refill_database.php" method="POST" class="form-container" style="margin-top:10px;">
                    <button type="submit">Refill Database</button>
                </form>
            </div>

            <div class="right-section">
            <form action="whine.php" method="POST" class="form-container">
                <input type="text"   name="first_name"     placeholder="Your First Name"      required />
                <input type="text"   name="last_name"      placeholder="Your Last Name"       required />
                <input type="email"  name="email"          placeholder="Your Email"           required />
                <input type="tel"    name="phone_number"   placeholder="Your Phone Number"    required />
                <input type="text"   name="street_address" placeholder="Your Street Address"  required />
                <input type="text"   name="city"           placeholder="Your City"            required />
                <input type="text"   name="state"          placeholder="Your State (e.g., CA)" required />
                <input type="text"   name="zip_code"       placeholder="Your Zip Code"        required />
                <textarea name="complaint_text" placeholder="Type your complaint here..." required></textarea>
                <button type="submit">Submit Complaint</button>
            </form>
            </div>
        </div>

        <?php
        if (isset($_SESSION['error'])) {
            echo "<div id='errorMessage' class='error'>" . htmlspecialchars($_SESSION['error']) . "</div>";
            unset($_SESSION['error']);
        } else if (isset($_SESSION['success'])) {
            echo "<div id='successMessage' class='success'>" . htmlspecialchars($_SESSION['success']) . "</div>";
            unset($_SESSION['success']);
        }
        ?>
    </div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const usernameInput = document.querySelector('input[name="username"]');
  if (usernameInput) {
    usernameInput.focus();
  }
});
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form[action="login_auth.php"]');
  const loginButton = document.getElementById('loginButton');

  if (loginForm) {
    loginForm.addEventListener('submit', function() {
      loginButton.disabled = true;
      loginButton.innerHTML = 'Logging in...'; // or you can add a spinner here
    });
  }
});
</script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const text = "IE332 Group 7";
  const speed = 130; // milliseconds between letters (you can adjust)
  let i = 0;
  const welcomeText = document.getElementById('welcomeText');

  function typeWriter() {
    if (i < text.length) {
      welcomeText.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }

  typeWriter();
});
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('passwordField');

  togglePassword.addEventListener('click', function () {
    // Toggle password visibility
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    // Change button text
    togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
  });
});
</script>


</body>
</html>