<?php
require_once('../includes/db.php'); // Correctly pointing to includes directory

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set JSON response headers
header('Content-Type: application/json');

// Get the action type from request
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch($action) {
    case 'test':
        echo json_encode(['success' => true, 'message' => 'API is working']);
        exit;
        break;
    case 'search':
        searchCustomer();
        break;
    case 'orders':
        getCustomerOrders();
        break;
    case 'update':
        updateCustomer();
        break;
    case 'get_orders':
        getDetailedOrders();
        break;
    
    case 'update_complaint':
    
        // 1) Read JSON body
        $input = json_decode(file_get_contents('php://input'), true);
        $id  = isset($input['complaint_id']) ? (int)$input['complaint_id'] : 0;
        $res = isset($input['resolution'])   ? trim($input['resolution'])   : '';

        // 2) Validate
        if ($id <= 0 || $res === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error'   => 'Invalid complaint ID or empty resolution'
            ]);
            exit;
        }

        // 3) Escape & update
        case 'update_complaint':
            // …
            $safe = $conn->real_escape_string($res);
            $sql = "
              UPDATE Complaints
                 SET ResolveText = '$safe',   -- ← use the actual column name
                     Status      = 'Resolved'
               WHERE ComplaintID = $id
            ";
            // …
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'DB error: ' . $conn->error
            ]);
        }
        exit;

    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error'   => 'Invalid action'
        ]);
        exit;
}

function searchCustomer() {
    global $conn;
    
    $search_term = isset($_GET['term']) ? $_GET['term'] : '';
    $search_term = $conn->real_escape_string($search_term);
    
    // Let's add some debugging to see what's happening
    error_log("Search term: " . $search_term);
    
    $sql = "
        SELECT 
            p.PersonID, p.FirstName, p.LastName, p.Email, p.PhoneNumber, 
            p.StreetAddress, p.City, p.State, p.ZipCode,
            CASE 
                WHEN ic.PersonID IS NOT NULL THEN 'Individual'
                WHEN cc.PersonID IS NOT NULL THEN 'Company'
            END as CustomerType,
            cc.CompanyName,
            cc.TaxID
        FROM People p
        LEFT JOIN IndividualCustomers ic ON p.PersonID = ic.PersonID
        LEFT JOIN CompanyCustomers cc ON p.PersonID = cc.PersonID
        WHERE 
            (ic.PersonID IS NOT NULL OR cc.PersonID IS NOT NULL)
            AND (
                p.PersonID LIKE ? OR
                p.FirstName LIKE ? OR
                p.LastName LIKE ? OR
                p.Email LIKE ? OR
                cc.CompanyName LIKE ? OR
                cc.TaxID LIKE ?
            )
        LIMIT 1
    ";

    $search_pattern = "%{$search_term}%";
    
    // Add error handling for prepare
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $conn->error
        ]);
        return;
    }
    
    $stmt->bind_param('ssssss', 
        $search_pattern, 
        $search_pattern, 
        $search_pattern, 
        $search_pattern, 
        $search_pattern, 
        $search_pattern
    );
    
    // Add error handling for execute
    if (!$stmt->execute()) {
        error_log("Execute failed: " . $stmt->error);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $stmt->error
        ]);
        $stmt->close();
        return;
    }
    
    // Instead of get_result(), use bind_result and fetch
    $person_id = $first_name = $last_name = $email = $phone = $street = $city = $state = $zip = $country = $customer_type = $company_name = $tax_id = null;
    
    $stmt->bind_result(
        $person_id, $first_name, $last_name, $email, $phone,
        $street, $city, $state, $zip, 
        $customer_type, $company_name, $tax_id
    );
    
    $found = $stmt->fetch();
    
    if ($found) {
        $customer = array(
            'PersonID' => $person_id,
            'FirstName' => $first_name,
            'LastName' => $last_name,
            'Email' => $email,
            'Phone' => $phone,
            'StreetAddress' => $street,
            'City' => $city,
            'State' => $state,
            'ZipCode' => $zip,
            'Country' => $country,
            'CustomerType' => $customer_type,
            'CompanyName' => $company_name,
            'TaxID' => $tax_id
        );
        
        // Format the address
        $customer['FullAddress'] = implode(', ', [
            $customer['StreetAddress'],
            $customer['City'],
            $customer['State'],
            $customer['ZipCode']
        ]);
        
        // Format the name
        $customer['FullName'] = $customer['FirstName'] . ' ' . $customer['LastName'];
        
        echo json_encode([
            'success' => true,
            'data' => $customer
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Customer not found'
        ]);
    }
    
    $stmt->close();
}

function getCustomerOrders() {
    global $conn;
    
    $person_id = isset($_GET['person_id']) ? (int)$_GET['person_id'] : 0;
    
    // First verify this is a valid customer
    $verify_sql = "
        SELECT PersonID FROM (
            SELECT PersonID FROM IndividualCustomers
            UNION
            SELECT PersonID FROM CompanyCustomers
        ) as Customers
        WHERE PersonID = ?
    ";
    
    $stmt = $conn->prepare($verify_sql);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $conn->error
        ]);
        return;
    }
    
    $stmt->bind_param('i', $person_id);
    
    if (!$stmt->execute()) {
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $stmt->error
        ]);
        $stmt->close();
        return;
    }
    
    // Use bind_result and fetch instead of get_result
    $valid_id = null;
    $stmt->bind_result($valid_id);
    $is_valid = $stmt->fetch();
    
    if (!$is_valid) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid customer ID'
        ]);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    $orders_sql = "
    SELECT 
            o.InvoiceNumber,
            o.OrderDate,
            o.Status,
            COALESCE(SUM(od.UnitPrice * od.Quantity), 0) AS Total,
            COALESCE(c.Status, 'None') AS ComplaintStatus
        FROM Orders o
        LEFT JOIN OrderDetails od ON o.InvoiceNumber = od.InvoiceNumber
        LEFT JOIN Complaints c ON o.InvoiceNumber = c.OrderID
        WHERE o.CustomerID = ?
        GROUP BY o.InvoiceNumber
        ORDER BY o.OrderDate DESC
    ";
    
    $stmt = $conn->prepare($orders_sql);
    $stmt->bind_param('i', $person_id);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($orderID, $orderDate, $status, $total, $complaintStatus);
    
    $orders = [];
    while ($stmt->fetch()) {
        $orders[] = [
            'OrderID' => $orderID,
            'OrderDate' => $orderDate,
            'Status' => $status,
            'Total' => $total,
            'ComplaintStatus' => $complaintStatus
        ];
    }    
    
    echo json_encode([
        'success' => true,
        'data' => [
            'orders' => $orders
        ]
    ]);
    
    $stmt->close();
}

// Stub for the updateCustomer function since it's referenced but not implemented
function updateCustomer() {
    echo json_encode([
        'success' => false,
        'error' => 'Function not implemented'
    ]);
}

// Stub for the getDetailedOrders function since it's referenced but not implemented
function getDetailedOrders() {
    echo json_encode([
        'success' => false,
        'error' => 'Function not implemented'
    ]);
}
?>