<?php
header('Content-Type: application/json');
require_once __DIR__ . '/helpers/db.php';

try {
    $conn = getDbConnection();
    $res = $conn->query("SELECT DATABASE() AS db");
    $row = $res->fetch_assoc();
    echo json_encode(["error"=>"", "env"=> (getenv('APP_ENV') ?: ""), "usingDb"=>$row["db"]]);
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["error"=>"Database connection failed"]);
}

