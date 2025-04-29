<?php
session_start();
require_once('includes/db.php');

try {
    // Disable foreign key checks temporarily
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");

    // List of all tables to clear
    $tables = [
        'CompanyCustomers',
        'Complaints',
        'Customers',
        'Employees',
        'IndividualCustomers',
        'OrderDetails',
        'Orders',
        'People',
        'Pickups',
        'Products'
    ];

    // Truncate each table
    foreach ($tables as $table) {
        $conn->query("TRUNCATE TABLE `$table`");
    }

    // Enable foreign key checks
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

    // Re-run startup SQL to repopulate necessary startup data
    $startup_sql = file_get_contents('startup_data.sql');
    if ($conn->multi_query($startup_sql)) {
        do {
            // Flush multi_query results
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
    }

    // Commit transaction
    $conn->commit();

    // Set a success message in session
    $_SESSION['success'] = "Database reset successfully!";
} catch (Exception $e) {
    // Rollback transaction if anything fails
    $conn->rollback();

    // Set an error message in session
    $_SESSION['error'] = "Failed to reset database: " . $e->getMessage();
}

// Close the database connection
$conn->close();

// Redirect back to the main page
header("Location: index.php");
exit();
?>