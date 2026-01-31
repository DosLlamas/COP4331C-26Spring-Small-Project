<?php
    /* 
    Made by Eduard Uy

    The following php script will be used for deleting a contact
    from the website. The premise is that it will connect to
    the mysql database and delete a contact.

    I imagined that the delete option would be a button by the contact
    but on HTML, the button's ID value would be linked to the contact's
    phone number.

    So when the phpscript receives the contact's phone number,
    it will search the database for the contact's phone number and delete
    contact/row.
    */

    // Creates a json object
    header('Content-Type: application/json');


    $todeletePHONE = filter_var($in["todeletePHONE"] ?? "", FILTER_SANITIZE_NUMBER_INT);

    
    //Note that a phone number MUST be attached to the contact to delete it from the database.

    if ($todeletePHONE === "") {
        echo json_encode(["error"=>"A contact must have a phone number to be deleted."]);
        exit;
    }

    require_once __DIR__ . "/helpers/db.php";


    try{
        $conn = getDbConnection();

        $stmt = $conn->prepare("DELETE FROM contacts where phone = ?");
        $stmt->bindParam("i", $todeletePHONE);

         // Simutaneously executes the prepared, binded statement and prints
        // Whether the execution was successful
        if (!$stmt->execute()) {
        // stmt->error is usually the best detail here
        echo json_encode(["error" => "Execute failed","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
        exit;
        }

        // Echoes whether the contact has been deleted.
        echo json_encode(["error"=>"", "Contact has been deleted."]);

        $stmt->close();
        $conn->close();

    }
    // End of try and catch: if any of the above code were to fail,
    // Prints reason why it failed in the server logs.
    catch (Throwable $e) {
        // Send detail back (dev only) + also log to Apache error log
        error_log("deleteContact.php exception: " . $e->getMessage());
        echo json_encode(["error" => "Server exception","message" => $e->getMessage()]);

}
?>