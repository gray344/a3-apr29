<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(E_ALL);
echo '<!-- SESSION[login]: ' . (isset($_SESSION['login']) ? $_SESSION['login'] : 'NOT SET') . ' -->';

session_start();
require_once '../includes/db.php';

// Helper: Basic HTML escape for PHP 5
function h($str) {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// Initialize messages
$successMsg = '';
$errorMsg = '';

// --- HANDLE FORM SUBMISSION ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type'])) {
    $actionType = $_POST['action_type'];

    // --- Individual Customer ---
    if ($actionType === 'indiv_customer') {
        $fname = isset($_POST['cust_fname']) ? trim($_POST['cust_fname']) : '';
        $lname = isset($_POST['cust_lname']) ? trim($_POST['cust_lname']) : '';
        $email = isset($_POST['cust_email']) ? trim($_POST['cust_email']) : '';
        $address = isset($_POST['cust_address']) ? trim($_POST['cust_address']) : '';

        $street = $address; $city = ''; $state = ''; $zip = ''; $phone = '';

        if ($fname && $lname && $email && $address) {
            try {
                $stmt = $conn->prepare("INSERT INTO People (FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssssss", $fname, $lname, $email, $phone, $street, $city, $state, $zip);
                $stmt->execute();
                $personId = $conn->insert_id;
                $stmt->close();

                $customerType = 'Individual';
                $stmt2 = $conn->prepare("INSERT INTO Customers (PersonID, CustomerType) VALUES (?, ?)");
                $stmt2->bind_param("is", $personId, $customerType);
                $stmt2->execute();
                $stmt2->close();

                $stmt3 = $conn->prepare("INSERT INTO IndividualCustomers (PersonID) VALUES (?)");
                $stmt3->bind_param("i", $personId);
                $stmt3->execute();
                $stmt3->close();

                $successMsg = "Individual customer created successfully.";
            } catch (mysqli_sql_exception $e) {
                if ($e->getCode() == 1062) {
                    $errorMsg = "A customer with this email already exists.";
                } else {
                    $errorMsg = "Database error: " . $e->getMessage();
                }
            }
        } else {
            $errorMsg = "All individual customer fields are required.";
        }

    // --- Company Customer ---
    } elseif ($actionType === 'company_customer') {
        $fname = isset($_POST['comp_fname']) ? trim($_POST['comp_fname']) : '';
        $lname = isset($_POST['comp_lname']) ? trim($_POST['comp_lname']) : '';
        $email = isset($_POST['comp_email']) ? trim($_POST['comp_email']) : '';
        $address = isset($_POST['comp_address']) ? trim($_POST['comp_address']) : '';
        $companyName = isset($_POST['company_name']) ? trim($_POST['company_name']) : '';
        $taxId = isset($_POST['tax_id']) ? trim($_POST['tax_id']) : '';

        $street = $address; $city = ''; $state = ''; $zip = ''; $phone = '';

        if ($fname && $lname && $email && $address && $companyName && $taxId) {
            try {
                $stmt = $conn->prepare("INSERT INTO People (FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssssss", $fname, $lname, $email, $phone, $street, $city, $state, $zip);
                $stmt->execute();
                $personId = $conn->insert_id;
                $stmt->close();

                $customerType = 'Company';
                $stmt2 = $conn->prepare("INSERT INTO Customers (PersonID, CustomerType) VALUES (?, ?)");
                $stmt2->bind_param("is", $personId, $customerType);
                $stmt2->execute();
                $stmt2->close();

                $stmt3 = $conn->prepare("INSERT INTO CompanyCustomers (PersonID, CompanyName, TaxID) VALUES (?, ?, ?)");
                $stmt3->bind_param("iss", $personId, $companyName, $taxId);
                $stmt3->execute();
                $stmt3->close();

                $successMsg = "Company customer created successfully.";
            } catch (mysqli_sql_exception $e) {
                if ($e->getCode() == 1062) {
                    $errorMsg = "A customer with this email already exists.";
                } else {
                    $errorMsg = "Database error: " . $e->getMessage();
                }
            }
        } else {
            $errorMsg = "All company customer fields are required.";
        }

    // --- Order ---
    } elseif ($actionType === 'order') {
        $cust_id = isset($_POST['order_cust_id']) ? trim($_POST['order_cust_id']) : '';
        $item_ids = isset($_POST['item_id']) ? $_POST['item_id'] : [];
        $quantities = isset($_POST['quantity']) ? $_POST['quantity'] : [];

        if ($cust_id && !empty($item_ids) && !empty($quantities)) {
            try {
                // Check if the customer exists
                $stmt = $conn->prepare("SELECT PersonID FROM Customers WHERE PersonID = ?");
                $stmt->bind_param("i", $cust_id);
                $stmt->execute();
                $stmt->store_result();
                if ($stmt->num_rows > 0) {
                    $stmt->close();

                    // Calculate the total order amount (mocking item prices for simplicity)
                    $total = 0;
                    $prices = []; // Mock prices; ideally, fetch from your database
                    foreach ($item_ids as $index => $item_id) {
                        $quantity = (int)$quantities[$index];
                        $mockPrice = 100; // Replace this with a database query to fetch the actual price
                        $prices[$item_id] = $mockPrice;
                        $total += $mockPrice * $quantity;
                    }

                    // Insert the order into the Orders table
                    $stmt2 = $conn->prepare("INSERT INTO Orders (CustomerID, OrderDate, PaymentStatus, Status, TotalAmount) VALUES (?, NOW(), 'Pending', 'Pending', ?)");
                    $stmt2->bind_param("id", $cust_id, $total);
                    if ($stmt2->execute()) {
                        $order_id = $conn->insert_id; // Get the generated OrderID
                        $stmt2->close();

                        // Insert each item into the OrderItems table
                        $stmt3 = $conn->prepare("INSERT INTO OrderItems (OrderID, ItemID, Quantity, Subtotal) VALUES (?, ?, ?, ?)");
                        foreach ($item_ids as $index => $item_id) {
                            $quantity = (int)$quantities[$index];
                            $subtotal = $prices[$item_id] * $quantity;
                            $stmt3->bind_param("iiid", $order_id, $item_id, $quantity, $subtotal);
                            $stmt3->execute();
                        }
                        $stmt3->close();

                        $successMsg = "Order created successfully with Order ID: " . $order_id;
                    } else {
                        $errorMsg = "Error creating order.";
                        $stmt2->close();
                    }
                } else {
                    $errorMsg = "Customer ID does not exist.";
                    $stmt->close();
                }
            } catch (mysqli_sql_exception $e) {
                $errorMsg = "Database error: " . $e->getMessage();
            }
        } else {
            $errorMsg = "All order fields are required, including at least one item and its quantity.";
        }
    // --- Pickup ---
    } elseif ($actionType === 'pickup') {
        $order_id = isset($_POST['pickup_order_id']) ? trim($_POST['pickup_order_id']) : '';
        $pickup_date = isset($_POST['pickup_date']) ? trim($_POST['pickup_date']) : '';
        $scheduled_by = isset($_POST['scheduled_by']) ? trim($_POST['scheduled_by']) : null;        if ($order_id && $pickup_date && $scheduled_by) {
            $stmt = $conn->prepare("SELECT InvoiceNumber FROM Orders WHERE InvoiceNumber = ?");
            $stmt->bind_param("i", $order_id);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                $stmt->close();
                $status = "Scheduled";
                $stmt2 = $conn->prepare("INSERT INTO Pickups (OrderID, ScheduledDate, ScheduledByEmployeeID, Status) VALUES (?, ?, ?, ?)");
                $stmt2->bind_param("isss", $order_id, $pickup_date, $scheduled_by, $status);
                if ($stmt2->execute()) {
                    $successMsg = "Pickup scheduled successfully.";
                } else {
                    $errorMsg = "Error scheduling pickup.";
                }
                $stmt2->close();
            } else {
                $errorMsg = "Order (InvoiceNumber) does not exist.";
                $stmt->close();
            }
        } else {
            $errorMsg = "All pickup fields are required.";
        }
    } else {
        $errorMsg = "Invalid action type.";
    }
} else {
    $errorMsg = "Invalid request.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create Instance Result</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header>
        <h1>SALESMAN DASHBOARD</h1>
    </header>
    <div class="container">
        <div class="card full-width">
            <div class="card-header">Create Instance Result</div>
            <div class="card-body">
                <?php if ($successMsg): ?>
                    <div class="status-paid"><?php echo h($successMsg); ?></div>
                <?php else: ?>
                    <div class="error"><?php echo h($errorMsg); ?></div>
                <?php endif; ?>
                <br>
                <a href="javascript:history.back()">Go Back</a>
            </div>
        </div>
    </div>
</body>
</html>