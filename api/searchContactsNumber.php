<?php

# Made by Eduard Uy
# The following php script is code for searching for a user via phone number
# This is a script that will automatically traverse the database and 
# returns the first unique contact with a phone number

# A lot of the code is based on Nathan Foss's addContact.php; therefore,
# there is a lot of code that resembles when a error occurs.

header('Content-Type: application/json'); // Defines the php to be a JSON

$in = json_decode(file_get_contents('php://input'), true); // Reads the user input



// Initializes variable to hold user input for phone number. If number has letters, it will remove the letters
$number = filter_var(trim($in["phone"] ?? ""), FILTER_SANITIZE_NUMBER_INT);


// At least one contact field required
if ($number === "") {
  echo json_encode(["error"=>"Please enter a phone number."]);
  exit;
}

// Pulls the function getDbConnection from the db.php file
require_once __DIR__ . "/helpers/db.php";


// Use a try and catch statement to catch any fk ups when trying to grab user
// From the database
try {
    // Call database function onto $conn variable
  $conn = getDbConnection();

  // Prepares the variable to find a user from contacts *Supposedly unique individual*
  $stmt = $conn->prepare(
    "SELECT Phone FROM Contacts
     WHERE Phone = ?"
  );

  // If no user is selected from the database, return an error
  if (!$stmt) {
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
  }

  // Uses $number as the parameters to find the contact
  $stmt->bind_param("i", $number);

  // Simutaneously executes the prepared, binded statement and prints
  // Whether the execution was successful
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
  $contact = $result->fetch_assoc();

    // Returns the associate array from $contact as a echo for the website to print.
  echo json_encode(["error"=>"", "Contact"=> $contact]);

  // Closes database.
  $stmt->close();
  $conn->close();
} 
// End of try and catch: if any of the above code were to fail,
// Prints reason why it failed in the server logs.
catch (Throwable $e) {
  // Send detail back (dev only) + also log to Apache error log
  error_log("AddContact.php exception: " . $e->getMessage());
  echo json_encode([
    "error" => "Server exception",
    "message" => $e->getMessage()
  ]);

}
?>
