<?php
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true);
$username = trim($in["username"] ?? "");
$password = $in["password"] ?? "";

if ($username === "" || $password === "") {
  echo json_encode(["error"=>"username and password required"]);
  exit;
}

require_once __DIR__ . "/helpers/db.php";


  $conn = getDbConnection();

  // Optional but recommended: hash passwords
  $hash = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $conn->prepare("INSERT INTO Users (Username, Password) VALUES (?, ?)");
  $stmt->bind_param("ss", $username, $hash);

  if (!$stmt->execute()) {
    // Duplicate username triggers MySQL error 1062
    if ($conn->errno === 1062) {
      echo json_encode(["error"=>"Username already exists"]);
    } else {
      echo json_encode(["error"=>"DB error: " . $conn->error]);
    }
    exit;
  }

  $userId = $conn->insert_id;
  echo json_encode(["error"=>"", "id"=>$userId, "Registered!"]);

  $stmt->close();
  $conn->close();

