const urlBase = 'http://dev.smallproject.nathanfoss.me/api';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
    userId = 0;
    firstName = "";
    lastName = "";

    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;
//	var hash = md5( password );

    document.getElementById("login-message").innerHTML = "";

    let tmp = {username: username,password: password};
//	var tmp = {login:login,password:hash};
    let jsonPayload = JSON.stringify( tmp );

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse( xhr.responseText );
                userId = jsonObject.id;

                if( userId < 1 )
                {
                    document.getElementById("login-message").innerHTML = "User/Password combination incorrect";
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("login-message").innerHTML = err.message;
    }

}

function doRegister()
{
    userId = 0;
    firstName = "";
    lastName = "";

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const registerMessage = document.getElementById("register-message");
    registerMessage.textContent = "";
//	var hash = md5( password );

    const tmp = {username: username, password: password};
//	var tmp = {login:login,password:hash};
    const jsonPayload = JSON.stringify( tmp );
    const url = urlBase + '/Register.' + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                const res = JSON.parse(xhr.responseText);

                if(res.error === ""){
                    registerMessage.textContent = "Registration successful! Redirecting to login";
                    registerMessage.style.color = "blue";

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                } else {
                    registerMessage.textContent = res.message || "Registration failed.";
                    registerMessage.style.color = "blue";
                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        registerMessage.textContent = err.message;
        registerMessage.style.color = "blue";
    }

}

function saveCookie()
{
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime()+(minutes*60*1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for(var i = 0; i < splits.length; i++)
    {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if( tokens[0] == "firstName" )
        {
            firstName = tokens[1];
        }
        else if( tokens[0] == "lastName" )
        {
            lastName = tokens[1];
        }
        else if( tokens[0] == "userId" )
        {
            userId = parseInt( tokens[1].trim() );
        }
    }

    if( userId < 0 )
    {
        window.location.href = "index.html";
    }
    else
    {
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
    }
}

function doLogout()
{
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

//adds a contact to the database using AddContact API
function addContact()
{
	// Get values from contacts HTML
	let first = document.getElementById("addFirst").value;
	let last = document.getElementById("addLast").value;
	let email = document.getElementById("addEmail").value;
	let phone = document.getElementById("addPhone").value;
	
    document.getElementById("contactAddResult").innerHTML = "";

	let tmp = { userId: userId,
  				firstName: first,
  				lastName: last,
  				phone: phone,
  				email: email
			};

	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

function searchContact()
{
    const srch = document.getElementById("searchText").value.trim();
    const resultDiv = document.getElementById("contactSearchResult");
    const resultsContainer = document.getElementById("contactResults");

    resultDiv.innerHTML = "";
    resultsContainer.innerHTML = "";

    const headers = ["First", "Last", "Phone", "Email", "", ""];
    headers.forEach(header => {
        const headerDiv = document.createElement("div");
        headerDiv.className = "grid-header";
        headerDiv.textContent = header;
        resultsContainer.appendChild(headerDiv);
    });

    if (srch === "")
    {
        resultDiv.innerHTML = "Please enter a search term";
        return;
    }

    let array = srch.split(" "); 
    let first = array[0] || ""; 
    let last = array[1] || "";

    let tmp = 
    {
        Enter_First_Name: first,
        Enter_Last_Name: last,
        Enter_Phone_Number: "",
        Enter_Email: "",        
        UserID: userId     
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/searchContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function()
    {
        if (this.readyState === 4 && this.status === 200)
        {
            const res = JSON.parse(xhr.responseText);

            if (res.error !== "")
            {
                resultDiv.innerHTML = res.error;
                return;
            }

            res["Relevant Contacts"].forEach(contact => {
                ["FirstName", "LastName", "Phone", "Email"].forEach(key => 
                {
                    const cell = document.createElement("div");
                    cell.textContent = contact[key];
                    resultsContainer.appendChild(cell);
                });
                
                const editBtn = document.createElement("button");
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.className = "edit-button";
                editBtn.onclick = () => editContact(contact.ID);
                resultsContainer.appendChild(editBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = "delete-button";
                deleteBtn.onclick = () => deleteContact(contact.ID);
                resultsContainer.appendChild(deleteBtn);
            });
        }
    };

    xhr.send(jsonPayload);
}

function getContacts(){
    const resultDiv = document.getElementById("contactSearchResult"); // Space to display retrieval results
    const resultsContainer = document.getElementById("contactResults"); // Space to display contacts

    resultsContainer.innerHTML = ""; // Ensure container is empty

    const headers = ["First", "Last", "Phone", "Email", "", ""];
    headers.forEach(header => {
        const headerDiv = document.createElement("div");
        headerDiv.className = "grid-header";
        headerDiv.textContent = header;
        resultsContainer.appendChild(headerDiv);
    });

    let tmp = { //json entry
        userId: userId,
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/GetContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

     xhr.onreadystatechange = function()
    {
        if (this.readyState === 4 && this.status === 200)
        {
            const res = JSON.parse(xhr.responseText);

            if (res.error !== "") // If there is an error
            {
                resultDiv.innerHTML = res.error; // Display the error
                return;
            }

            res.Contacts.forEach(contact => {
                // Add the 4 data cells
                ["FirstName", "LastName", "Phone", "Email"].forEach(key => 
                {
                    const cell = document.createElement("div");
                    cell.textContent = contact[key];
                    resultsContainer.appendChild(cell);
                });
                
                // Edit button
                const editBtn = document.createElement("button");
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.className = "edit-button";
                editBtn.onclick = () => editContact(contact.ID);
                resultsContainer.appendChild(editBtn);

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = "delete-button";
                deleteBtn.onclick = () => deleteContact(contact.ID);
                resultsContainer.appendChild(deleteBtn);
            });
        }
    };

    xhr.send(jsonPayload);

}

function editContact(contactId) // Edit the contact using modal
{
    // Get the modal
    const modal = document.getElementById("editModal");
    
    // Store the contact ID
    document.getElementById("editContactId").value = contactId;
    
    // TODO: Fetch current contact data and populate fields
    // For now, just show the modal
    modal.style.display = "block";
}

function closeModal() // Close modal on click
{
    document.getElementById("editModal").style.display = "none";
}

function saveEdit() // Send edits to API
{
    const id = document.getElementById("editContactId").value;
    const first = document.getElementById("editFirst").value;
    const last = document.getElementById("editLast").value;
    const phone = document.getElementById("editPhone").value;
    const email = document.getElementById("editEmail").value;
    
    // TODO: Send update to Edit API
    console.log("Saving:", {id, first, last, phone, email});
    
    closeModal();
}


window.onclick = function(event) // Close modal when clicking outside of it
{
    const modal = document.getElementById("editModal");
    if (event.target == modal) {
        closeModal();
    }
}

function deleteContact()
{

}
