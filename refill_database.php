<?php
session_start();

// 1) Turn on full error reporting so you can actually see the problem instead of a blank 500 page
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once('includes/db.php');

try {
    // 2) Disable autocommit to start a transaction
    if (! $conn->autocommit(FALSE)) {
        throw new Exception("Could not disable autocommit: " . $conn->error);
    }

    // 3) Disable foreign key checks
    if (! $conn->query("SET FOREIGN_KEY_CHECKS = 0")) {
        throw new Exception("Could not disable FK checks: " . $conn->error);
    }

    //
    // 5) Load your fake_data.sql
    //
    $fake_sql = file_get_contents(__DIR__ . '/fake-data.sql');
    if ($fake_sql === false) {
        throw new Exception("Cannot read fake_data.sql");
    }
    if (! $conn->multi_query($fake_sql)) {
        throw new Exception("Error running fake_data.sql: " . $conn->error);
    }
    do {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    } while ($conn->more_results() && $conn->next_result());

    // 6) Re-enable foreign key checks
    if (! $conn->query("SET FOREIGN_KEY_CHECKS = 1")) {
        throw new Exception("Could not re-enable FK checks: " . $conn->error);
    }

    // 7) Commit the transaction
    if (! $conn->commit()) {
        throw new Exception("Commit failed: " . $conn->error);
    }

    // 8) Restore autocommit
    $conn->autocommit(TRUE);

    $_SESSION['success'] = "Database refilled with fake data!";
} catch (Exception $e) {
    // Roll back on any error
    $conn->rollback();

    // Make sure FK checks & autocommit get turned back on
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");
    $conn->autocommit(TRUE);

    $_SESSION['error'] = "Failed to refill database: " . $e->getMessage();
}

// Close and redirect
$conn->close();
header("Location: index.php");
exit();
?>