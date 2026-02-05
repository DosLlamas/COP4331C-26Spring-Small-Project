<?php
    /*
        Written by: Eduard Uy

        This is a new script that will replace the old deleteContact.php
        This script will utilize the unique IDs under a contact which will be the input
        This script will also use the UserID to increase security between users, server-side input

    */

    //Import helper library    
    require_once __DIR__ . "/helper/db.php";

    // Returns requested contents from user to the variable
    $requestedData = json_decode(file_get_contents('php://input'), true);

    // Calls a connection to the database
    $conn = getDbConnection();

    // Prepares statement to delete a row with a matching ID tag and UserID
    $stmt = $conn->prepare("DELETE FROM Contacts where ID = ? AND UserID = ?");
    // Binds the input statements into the parameter.
    // Casts inputs into Integers, both ID and UserID
    $stmt->bindParam("ii", intval($requestedData["Insert_ContactID"]), intval($requestedData["Insert_UserID"]));
    
    // If statement to catch if statement failed
    if (!$stmt->execute()) {
        // stmt->error is usually the best detail here
        echo json_encode(["error" => "Execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
        exit;
    }

            // Echoes whether the contact has been deleted.
    echo json_encode(["error"=>"", "Contact has been deleted."]);

    $stmt->close();
    $conn->close();
?>