<?php
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require_once 'includes/db.php';

if (!$conn || $conn->connect_error) {
    $_SESSION['error'] = "User not found.";
    header("Location: index.php"); // or whatever your login form file is called
    exit();
}

// These are the user inputs
$username = $_POST['username'];
$password = $_POST['password'];

// Debugging
// echo "DEBUG: Username = $username<br>Password = $password<br>";

// This is checking within SQL for the username
$sql = "SELECT * FROM Employees WHERE PersonID = ? LIMIT 1";
$stmt = $conn->prepare($sql);

// If the SQL statement fails, it will return an error message
// and redirect to the login page
if (!$stmt) {
    $_SESSION['error'] = "Query error";
    header("Location: index.php");
    exit();
}

$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

// This chunk is checking if password is associated with username
// And checking what role is associated with username -> sending to salesman/manager php page
// Will return appropriate error depending on what's inconsistent

if ($stmt->num_rows === 1) {
    $stmt->bind_result($personID, $role, $hireDate, $terminationDate, $dbPassword);
    $stmt->fetch();

    if ($password === $dbPassword) { // if using plain text passwords
        $_SESSION['user_id'] = $personID;
        $_SESSION['role'] = $role;

        // Redirect based on role
        if (strtolower($role) === 'sales') {
            header("Location: dashboard/salesman.php");
            exit();
        } elseif (strtolower($role) === 'manager') {
            header("Location: dashboard/manager.php");
            exit();
        } else {
            $_SESSION['error'] = "Unknown role.";
            header("Location: index.php");
            exit();
        }
    } else {
        $_SESSION['error'] = "Invalid password.";
        header("Location: index.php");
        exit();
    }
} else {
    $_SESSION['error'] = "User not found.";
    header("Location: index.php");
    exit();
}
