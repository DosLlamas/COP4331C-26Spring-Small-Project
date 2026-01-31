<?php
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true);

$userId    = intval($in["userId"] ?? 0);
$firstName = trim($in["firstName"] ?? "");
$lastName  = trim($in["lastName"] ?? "");
$phone     = filter_var(trim($in["phone"] ?? ""), FILTER_SANITIZE_NUMBER_INT);
$email     = trim($in["email"] ?? "");

if ($userId <= 0) {
  echo json_encode(["error"=>"userId required"]);
  exit;
}

// At least one contact field required
if ($firstName==="" && $lastName==="" && $phone==="" && $email==="") {
  echo json_encode(["error"=>"At least one contact field is required"]);
  exit;
}

require_once __DIR__ . "/helpers/db.php";

try {
  $conn = getDbConnection();

  $stmt = $conn->prepare(
    "INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID)
     VALUES (?, ?, ?, ?, ?)"
  );

  if (!$stmt) {
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
  }

  $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);

  if (!$stmt->execute()) {
    // stmt->error is usually the best detail here
    echo json_encode([
      "error" => "Execute failed",
      "mysql_errno" => $stmt->errno,
      "mysql_error" => $stmt->error
    ]);
    exit;
  }

  echo json_encode(["error"=>"", "contactId"=>$conn->insert_id]);

  $stmt->close();
  $conn->close();
} catch (Throwable $e) {
  // Send detail back (dev only) + also log to Apache error log
  error_log("AddContact.php exception: " . $e->getMessage());
  echo json_encode([
    "error" => "Server exception",
    "message" => $e->getMessage()
  ]);
}

