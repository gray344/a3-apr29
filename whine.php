<?php
// DEV: show all errors
ini_set('display_startup_errors',1);
ini_set('display_errors',1);
error_reporting(E_ALL);

session_start();
require_once 'includes/db.php';

// 1) Sanitize inputs
$fn     = isset($_POST['first_name'])     ? trim($_POST['first_name'])     : '';
$ln     = isset($_POST['last_name'])      ? trim($_POST['last_name'])      : '';
$em     = isset($_POST['email'])          ? trim($_POST['email'])          : '';
$phone  = isset($_POST['phone_number'])   ? trim($_POST['phone_number'])   : '';
$street = isset($_POST['street_address']) ? trim($_POST['street_address']) : '';
$city   = isset($_POST['city'])           ? trim($_POST['city'])           : '';
$state  = isset($_POST['state'])          ? trim($_POST['state'])          : '';
$zip    = isset($_POST['zip_code'])       ? trim($_POST['zip_code'])       : '';
$ct     = isset($_POST['complaint_text']) ? trim($_POST['complaint_text']) : '';

// 2) Basic validation
if (!$fn || !$ln || !$em || !$phone || !$street || !$city || !$state || !$zip || !$ct) {
  die("All fields are required.");
}

// 3) Find or create in People
$stmt = $conn->prepare("
  SELECT PersonID
    FROM People
   WHERE FirstName=? AND LastName=? AND Email=?
   LIMIT 1
");
if (!$stmt) die("Lookup prepare failed: " . $conn->error);
$stmt->bind_param("sss", $fn, $ln, $em);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
  $stmt->bind_result($personID);
  $stmt->fetch();
  $stmt->close();
} else {
  $stmt->close();
  $insP = $conn->prepare("
    INSERT INTO People
      (FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ");
  if (!$insP) die("Insert(People) prepare failed: " . $conn->error);
  $insP->bind_param(
    "ssssssss",
    $fn, $ln, $em,
    $phone, $street,
    $city, $state, $zip
  );
  if (!$insP->execute()) die("Insert(People) execute failed: " . $insP->error);
  $personID = $conn->insert_id;
  $insP->close();
}

// 4) Ensure a Customers row (so FK won’t break)
$insC = $conn->prepare("
  INSERT IGNORE INTO Customers (PersonID, CustomerType)
  VALUES (?, 'Individual')
");
if (!$insC) die("Insert(Customers) prepare failed: " . $conn->error);
$insC->bind_param("i", $personID);
if (!$insC->execute()) die("Insert(Customers) execute failed: " . $insC->error);
$insC->close();

// 5) Insert the complaint
$ins = $conn->prepare("
  INSERT INTO Complaints (CustomerID, ComplaintText, Status)
  VALUES (?, ?, 'Open')
");
if (!$ins) die("Insert(Complaints) prepare failed: " . $conn->error);
$ins->bind_param("is", $personID, $ct);
if (!$ins->execute()) die("Insert(Complaints) execute failed: " . $ins->error);

// 6) Redirect on success
header("Location: thank_you.php");
exit;
