const urlBase = 'http://dev.smallproject.nathanfoss.me/api';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function validateEmail(email){

    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regex.test(email);
}

function validatePhoneNumber(phone){

    let regex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;

    return regex.test(phone);
}

//ADD DASHES TO PHONE NUMBER FOR VIEWING XXX-XXX-XXXX
function normalizePhoneNumber(phone){

    let stripped = phone.replace(/\D/g, ''); //strip dashes if already exist

    return stripped.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3'); //return phone number with dashes
}


function showRegUsernameError() {
    document.getElementById("register-error-img").style.display = "inline";
}
function hideRegUsernameError() {
    document.getElementById("register-error-img").style.display = "none";
}

function showLogUsernameError() {
    document.getElementById("login-username-error-img").style.display = "inline";
}

function hideLogUsernameError() {
    document.getElementById("login-username-error-img").style.display = "none";
}

function showLogPasswordError() {
    document.getElementById("login-password-error-img").style.display = "inline";
}

function hideLogPasswordError() {
    document.getElementById("login-password-error-img").style.display = "none";
}


function showPhoneError() {
    document.getElementById("phone-error-img").style.display = "inline";
}

function hidePhoneError() {
    document.getElementById("phone-error-img").style.display = "none";
}

function showEmailError() {
    document.getElementById("email-error-img").style.display = "inline";
}

function hideEmailError() {
    document.getElementById("email-error-img").style.display = "none";
}

function showLoginErrorImg(error){

    switch(error){

        case "Username required":
            showLogUsernameError();
            return;

        case "Password required":
            showLogPasswordError();
            return;

        default:
            showLogUsernameError();
            showLogPasswordError();
            return;
    }
}




function doLogin()
{
    userId = 0;
    firstName = "";
    lastName = "";

    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;
//	var hash = md5( password );

    const loginMessage = document.getElementById("login-message");
    loginMessage.textContent = "";


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

                if(jsonObject.error && jsonObject.error !== ""){
                    showLoginErrorImg(jsonObject.error);
                    loginMessage.textContent = jsonObject.error;
                    return;
                }

                hideLogUsernameError();
                hideLogPasswordError();

                userId = jsonObject.id;
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
                    hideRegUsernameError();
                    registerMessage.textContent = "Registration successful! Redirecting to login";
                    registerMessage.style.color = "blue";

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                } else {
                    showRegUsernameError();
                    registerMessage.textContent = res.message || "Username taken.";
                    registerMessage.style.color = "red";

                }
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        registerMessage.textContent = err.message;
        registerMessage.style.color = "red";
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

        // Validate Email
        let validEmail = validateEmail(email);
        if (!validEmail) {
            document.getElementById("contactAddResult").innerHTML = "Invalid Email Address.";
            showEmailError();
            return;
        }
        hideEmailError();

        // Validate Phone
        let validPhone = validatePhoneNumber(phone);
        if (!validPhone) {
            document.getElementById("contactAddResult").innerHTML = "Invalid Phone Number.";
            showPhoneError();
            return;
        }
        hidePhoneError();
        phone = normalizePhoneNumber(phone);

        let tmp = {
            userId: userId,
            firstName: first,
            lastName: last,
            phone: phone,
            email: email
        };

        let jsonPayload = JSON.stringify(tmp);

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
				 // Success - clear the fields
                document.getElementById("addFirst").value = "";
                document.getElementById("addLast").value = "";
                document.getElementById("addPhone").value = "";
                document.getElementById("addEmail").value = "";
                
                document.getElementById("contactAddResult").innerHTML = "Contact added successfully!";
                
                // Refresh contact list
                //If there is an element in any search bar
                if (document.getElementById("searchFirst") != "" || document.getElementById("searchLast") != "" ||
                document.getElementById("SearchPhone") != "" || document.getElementById("SearchEmail") != "")
                {
                    searchContact(); // Refresh with the same search
                } 
                else
                {
                    getContacts(); // Refresh with all contacts
                }
                // Clear success message after 3 seconds
                setTimeout(() => {
                    document.getElementById("contactAddResult").innerHTML = "";
                }, 3000);

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
    let searchFirst = document.getElementById("searchFirst").value.trim();
    let searchLast = document.getElementById("searchLast").value.trim();
    let searchPhone = document.getElementById("searchPhone").value.trim();
    let searchEmail = document.getElementById("searchEmail").value.trim();
    const resultDiv = document.getElementById("contactSearchResult");
    const resultsContainer = document.getElementById("contactResults");

    resultDiv.innerHTML = "";
    resultsContainer.innerHTML = "";

    // Set the headers in the grid
    const headers = ["First", "Last", "Phone", "Email", "Edit", "Delete"];
    headers.forEach(header => {
        const headerDiv = document.createElement("div");
        if(header == "Edit"){
            headerDiv.className = "grid-header-edit";
        }
        else{
            headerDiv.className = "grid-header";
        }
        headerDiv.textContent = header;
        resultsContainer.appendChild(headerDiv);
    });

    //Json format
    let tmp = {
        Enter_First_Name: searchFirst,
        Enter_Last_Name: searchLast,
        Enter_Phone_Number: searchPhone,
        Enter_Email: searchEmail,
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

            console.log("Full response:", res);
            console.log("Contacts array:", res["Relevant Contacts"]);

            if (res.error !== "")
            {
                resultDiv.innerHTML = "No results found.";
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
                editBtn.onclick = () => editContact(contact);
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

    const headers = ["First", "Last", "Phone", "Email", "Edit", "Delete"];
    headers.forEach(header => {
        const headerDiv = document.createElement("div");
        if(header == "Edit"){
            headerDiv.className = "grid-header-edit";
        }
        else{
            headerDiv.className = "grid-header";
        }
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
                editBtn.innerHTML = '<i class="fas fa-edit" aria-hidden="true"></i>';
                editBtn.className = "edit-button";
                editBtn.setAttribute("aria-label", "Edit contact");
                editBtn.onclick = () => editContact(contact);
                resultsContainer.appendChild(editBtn);

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>';
                deleteBtn.className = "delete-button";
                deleteBtn.setAttribute("aria-label", "Delete contact");
                deleteBtn.onclick = () => deleteContact(contact.ID);
                resultsContainer.appendChild(deleteBtn);
            });
        }
    };

    xhr.send(jsonPayload);

}

function editContact(contact) // Edit the contact using modal
{
    // Get the modal
    const modal = document.getElementById("editModal");

    // Store ContactID
    document.getElementById("editContactId").value = contact.ID;

    // Pre-fill the form fields with current data
    document.getElementById("editFirst").value = contact.FirstName;
    document.getElementById("editLast").value = contact.LastName;
    document.getElementById("editPhone").value = contact.Phone;
    document.getElementById("editEmail").value = contact.Email;

    // TODO: Fetch current contact data and populate fields
    // For now, just show the modal
    modal.style.display = "block";
}

function closeModal() // Close modal on click
{
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editResult").innerHTML = "";
}

function saveEdit() // Send edits to API
{
    let id = document.getElementById("editContactId").value;
    let first = document.getElementById("editFirst").value;
    let last = document.getElementById("editLast").value;
    let phone = document.getElementById("editPhone").value;
    let email = document.getElementById("editEmail").value;

    let validEmail = validateEmail(email);
        if (!validEmail) {
            document.getElementById("editResult").innerHTML = "Invalid Email Address.";
            return;
        }

    let validPhone = validatePhoneNumber(phone);
    if (!validPhone) {
        document.getElementById("editResult").innerHTML = "Invalid Phone Number.";
        return;
    }
    phone = normalizePhoneNumber(phone);

    let tmp =
    {
        Enter_ContactID: parseInt(id),
        Change_First_Name: first,
        Change_Last_Name: last,
        Change_Phone: phone,
        Change_Email: email,
        Enter_UserID: userId
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/updateContact.' + extension;

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
                console.log("Error:", res.error);
                return;
            }

            closeModal();

            // Refresh the contacts list
            // If there is an element in any search bar
            if (document.getElementById("searchFirst") != "" || document.getElementById("searchLast") != "" ||
            document.getElementById("SearchPhone") != "" || document.getElementById("SearchEmail") != "")
            {
                searchContact(); // Refresh with the same search
            } 
            else
            {
                getContacts(); // Refresh with all contacts
            }
        }
    };

    xhr.send(jsonPayload);
}



window.onclick = function(event) // Close modal when clicking outside of it
{
    const modal = document.getElementById("editModal");
    if (event.target == modal) {
        closeModal();
    }
}

function deleteContact(contactId)
{
    // Confirm before deleting
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

    let tmp = {
        Insert_ContactID: contactId,
        Insert_UserID: userId
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/deleteContact.' + extension;

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
                alert("Error: " + res.error);
                return;
            }

            // Success - refresh the contact list
            alert("Contact deleted successfully!");

            //Refresh contacts
            //If there is an element in any search bar
            if (document.getElementById("searchFirst") != "" || document.getElementById("searchLast") != "" ||
            document.getElementById("SearchPhone") != "" || document.getElementById("SearchEmail") != "")
            {
                searchContact(); // Refresh with the same search
            } 
            else
            {
                getContacts(); // Refresh with all contacts
            }
        }
    };

    xhr.send(jsonPayload);
}

function toggleTheme() {

    const root = document.documentElement;
    if (root.getAttribute("data-theme") === "alternate1") {

        root.setAttribute("data-theme", "alternate2");
        localStorage.setItem("theme", "alternate2");
    }
    else if (root.getAttribute("data-theme") === "alternate2") {

        root.removeAttribute("data-theme");
        localStorage.removeItem("theme");
    }
    else{
        root.setAttribute("data-theme", "alternate1");
        localStorage.setItem("theme", "alternate1");
    }

}

const root = document.documentElement;
let NORMAL_FONT = parseFloat(getComputedStyle(root).fontSize);
let multiplier = parseFloat(localStorage.getItem("fontMultiplier")) || 1;
function increaseTextSize(){
    multiplier = Math.min(multiplier + .1, 1.5);
    setTextSize()
}

function decreaseTextSize(){
    multiplier = Math.max(multiplier - .1, .5);
    setTextSize()
}

function resetTextSize(){
    multiplier = 1;
    setTextSize();
}

function setTextSize(){
    root.style.fontSize = `${NORMAL_FONT * multiplier}px`;
    localStorage.setItem("fontMultiplier", multiplier);
}

const themeSaved = localStorage.getItem("theme");

if (themeSaved) {
    document.documentElement.setAttribute("data-theme", themeSaved);
}


setTextSize();
