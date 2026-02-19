<?php

    /*
        Written by Eduard Uy

        The following script will be for updating the contacts within the database
        This script will be a little long since I will be using if statements to check
        whether the user has inputted changes to multiple elements in the contact.

    */


        // Imports helper library
     require_once __DIR__ . "/helpers/db.php";

     // Header will return json object
     header('Content-Type: application/json');

     // Returns requested contents from user to the variable
     $requestedData = json_decode(
     file_get_contents('php://input'), true);

    // Calls a connection to the database
    $conn = getDbConnection();

    // Initialize and store data within variables

    $changingContactID = intval(trim($requestedData['Enter_ContactID']));
    $changeFirstName = trim($requestedData['Change_First_Name']);
    $changeLastName = trim($requestedData['Change_Last_Name']);
    $changePhone = trim($requestedData['Change_Phone']);
    $changeEmail = trim($requestedData['Change_Email']);
    $UserID = intval(trim($requestedData['Enter_UserID']));

    // An if statement will be done for all features of the Contact
    if($changeFirstName !== ""){
        // Creates a statement variable that will send instructions to database
        // Readies to update just the first name of the Contacts row
        $stmt = $conn->prepare("UPDATE Contacts
            SET FirstName = ? WHERE UserID = ? AND ID = ?");

        $stmt->bind_param("sii", $changeFirstName, $UserID, $changingContactID);
            // Execute statement and if return false, then return error messages.
        if (!$stmt->execute()) {
            // stmt->error is usually the best detail here
            echo json_encode(["error" => "First Name Change execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
            exit;
        }

        $stmt->close();
    }

    if($changeLastName !== ""){
        // Creates a statement variable that will send instructions to database
        // Readies to update just the Last Name of the Contacts row
        $stmt = $conn->prepare("UPDATE Contacts
            SET LastName = ? WHERE UserID = ? AND ID = ?");

        $stmt->bind_param("sii", $changeLastName, $UserID, $changingContactID);
             // Execute statement and if return false, then return error messages.
        if (!$stmt->execute()) {
            // stmt->error is usually the best detail here
            echo json_encode(["error" => "Last Name Change execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
            exit;
        }

        $stmt->close();
    }

    if($changePhone !== ""){
        // Creates a statement variable that will send instructions to database
        // Readies to update just the phone number of the Contacts row
        $stmt = $conn->prepare("UPDATE Contacts
            SET Phone = ? WHERE UserID = ? AND ID = ?");

        $stmt->bind_param("sii", $changePhone, $UserID, $changingContactID);
            // Execute statement and if return false, then return error messages.
        if (!$stmt->execute()) {
            // stmt->error is usually the best detail here
            echo json_encode(["error" => "Phone Change execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
            exit;
        }

        $stmt->close();
    }

    if($changeEmail !== ""){
        // Creates a statement variable that will send instructions to database
        // Readies to update just the Email of the Contacts row
        $stmt = $conn->prepare("UPDATE Contacts
            SET Email = ? WHERE UserID = ? AND ID = ?");

        $stmt->bind_param("sii", $changeEmail, $UserID, $changingContactID);
             // Execute statement and if return false, then return error messages.
        if (!$stmt->execute()) {
            // stmt->error is usually the best detail here
            echo json_encode(["error" => "Email change execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
            exit;
        }

        $stmt->close();
    }

    // Echoes whether the contact has been edited.
    echo json_encode(["error"=>"", "Message" => $changingContactID . " ID: Contact has been edited."]);

    $conn->close();
    
?>
