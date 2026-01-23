<?php
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true);

$username = trim($in["username"] ?? "");
$password = $in["password"] ?? "";

if ($username === "" || $password === "") {
  echo json_encode(["error" => "username and password required", "id" => 0]);
  exit;
}

require_once __DIR__ . "/helpers/db.php";

try {
  $conn = getDbConnection();

  $stmt = $conn->prepare("SELECT ID, Password FROM Users WHERE Username = ? LIMIT 1");
  if (!$stmt) {
    echo json_encode(["error" => "Prepare failed", "id" => 0]);
    exit;
  }

  $stmt->bind_param("s", $username);

  if (!$stmt->execute()) {
    echo json_encode(["error" => "Execute failed", "id" => 0]);
    exit;
  }

  $result = $stmt->get_result();
  if (!$row = $result->fetch_assoc()) {
    // Username not found
    echo json_encode(["error" => "Invalid username or password", "id" => 0]);
    exit;
  }

  $userId = intval($row["ID"]);
  $hash = $row["Password"];

  if (!password_verify($password, $hash)) {
    echo json_encode(["error" => "Invalid username or password", "id" => 0]);
    exit;
  }

  echo json_encode(["error" => "", "id" => $userId]);

  $stmt->close();
  $conn->close();
} catch (Throwable $e) {
  // Log full detail server-side, keep response simple
  error_log("Login.php exception: " . $e->getMessage());
  echo json_encode(["error" => "Server error", "id" => 0]);
}

