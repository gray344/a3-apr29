<?php
require_once(__DIR__ . '/db.php');

$term = isset($_GET['term']) ? $_GET['term'] : '';
$term = $conn->real_escape_string($term);

$sql = "
    SELECT 
        p.id,
        p.name as label,
        p.brand,
        p.category,
        p.size,
        p.sizeunit,
        p.stock,
        p.storage,
        CONCAT(p.id, ' - ', p.name, ' (', p.brand, ')') as value
    FROM Products p
    WHERE p.id LIKE '{$term}%' 
    OR p.name LIKE '%{$term}%'
    OR p.brand LIKE '%{$term}%'
    LIMIT 10";

$result = $conn->query($sql);
$items = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    $result->free();
}

header('Content-Type: application/json');
echo json_encode($items);
?>