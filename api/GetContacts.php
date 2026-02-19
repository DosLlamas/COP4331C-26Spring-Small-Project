<?php
/*
Created by Nathan Foss, 02/04/2026

This program ouputs the list of all contacts for one user, given the userId.
*/
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true); // Reads the user input

$userId    = intval($in["userId"] ?? 0);

if ($userId <= 0) {
    echo json_encode(["error" => "userId required"]);
    exit;
}

require_once __DIR__ . "/helpers/db.php";

try {
    $conn = getDbConnection();
    $stmt = $conn->prepare(
        "SELECT ID, FirstName, LastName, Phone, Email FROM Contacts 
        WHERE UserID = ?"
    );

    if (!$stmt) {
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $userId);

    if (!$stmt->execute()) {
        // stmt->error is usually the best detail here
        echo json_encode([
            "error" => "Execute failed",
            "mysql_errno" => $stmt->errno,
            "mysql_error" => $stmt->error
        ]);
        exit;
    }

    //Creates variables to store the first contacts 
    $result = $stmt->get_result();
    $contacts = $result->fetch_all(MYSQLI_ASSOC);
    // Returns the associate array from $contacts as a echo for the website to print.
    echo json_encode(array("error"=>"", "Contacts"=> $contacts));
    // Closes database.
    $stmt->close();
    $conn->close();
}
catch(Throwable $e) {
    // Send detail back (dev only) + also log to Apache error log
  error_log("GetContacts.php exception: " . $e->getMessage());
  echo json_encode([
    "error" => "Server exception",
    "message" => $e->getMessage()
  ]);
}

?>