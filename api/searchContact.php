<?php

     # The following code is a revamped script
     # of the previous search First/Last Name.
     # The model will be based of Leitnecker's code

     # Written by Eduard Uy

     // Imports helper library
     require_once __DIR__ . "/helpers/db.php";

     // Header will return json object
     header('Content-Type: application/json');

     // Returns requested contents from user to the variable
     $requestedData = json_decode(
     file_get_contents('php://input'), true);

     // Calls a connection to the database
     $conn = getDbConnection();

     // Creates a statement variable that will send instructions to database
     // Returns rows of relevant contacts to First + Last Name with UserID
     $stmt = $conn->prepare("SELECT FirstName, LastName, Phone, Email, 
          ID FROM Contacts
          WHERE FirstName LIKE ? AND LastName LIKE ? AND Phone LIKE ? AND Email LIKE ? AND UserID = ?");

     // Initialize variables and equate to inputted data.
     // Even if one of the inputs were empty, it'll return at least SOMETHING
     // Between the two inputs.
     // Ex. If last name were empty, it'll still use the First Name to search.
     $requestedFirstName = "%" . $requestedData["Enter_First_Name"] . "%";
     $requestedLastName = "%". $requestedData["Enter_Last_Name"] . "%";
	 $requestedPhone = "%" . $requestedData["Enter_Phone_Number"] . "%";
	 $requestedEmail = "%" . $requestedData["Enter_Email"] . "%";
     $requestingUserID = $requestedData["UserID"];

     // Bind the variables to the statement's query
     $stmt->bind_param("ssssi", $requestedFirstName, $requestedLastName, $requestedPhone, $requestedEmail, $requestingUserID);

     // Execute statement and if return false, then return error messages.
     if (!$stmt->execute()) {
          // stmt->error is usually the best detail here
          echo json_encode(["error" => "","mysql_errno" => $stmt->errno,"mysql_error" => $stmt->error]);
          exit;
     }

     // Put result in a variable
     $result = $stmt->get_result();

     // Count how many contacts were returned
     $searchCount = $result->num_rows;

     // If statement if no contacts were found. Send no contacts found.
     // Otherwise, send associative array 
	if( $searchCount == 0 ){
		echo json_encode( "No Contacts Found" );
	}
	else{
          echo json_encode(array("error"=>"", "Relevant Contacts"=>$result->fetch_all(MYSQLI_ASSOC)));
     }

     // Close links to the database.
	$stmt->close();
	$conn->close();



?>






