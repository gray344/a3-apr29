<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Log connection attempt
error_log("Attempting database connection to mydb.itap.purdue.edu");

$servername = "mydb.itap.purdue.edu";
$username = "g1145457";
$password = "ie332";
$database = $username;

try {
    $conn = new mysqli();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 30); 
    $conn->real_connect($servername, $username, $password, $database);
    $conn->set_charset("utf8mb4");
    
    error_log("Database connection successful");
} catch (mysqli_sql_exception $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die("DB CONNECTION ERROR: " . $e->getMessage());
}
?>