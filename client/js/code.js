const urlBase = 'http://dev.smallproject.nathanfoss.me/api';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";


function validateEmail(email){

    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;

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
                    hideUserNameError();
                    registerMessage.textContent = "Registration successful! Redirecting to login";
                    registerMessage.style.color = "blue";

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                } else {
                    showUserNameError();
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
    function showUserNameError() {
        const image = document.getElementById("username-error-img").style.display = "inline";
    }

    function hideUserNameError() {
        const image = document.getElementById("username-error-img").style.display = "none";
    }


    function saveCookie() {
        let minutes = 20;
        let date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
    }

    function readCookie() {
        userId = -1;
        let data = document.cookie;
        let splits = data.split(",");
        for (var i = 0; i < splits.length; i++) {
            let thisOne = splits[i].trim();
            let tokens = thisOne.split("=");
            if (tokens[0] == "firstName") {
                firstName = tokens[1];
            } else if (tokens[0] == "lastName") {
                lastName = tokens[1];
            } else if (tokens[0] == "userId") {
                userId = parseInt(tokens[1].trim());
            }
        }

        if (userId < 0) {
            window.location.href = "index.html";
        } else {
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
        }
    }

    function doLogout() {
        userId = 0;
        firstName = "";
        lastName = "";
        document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "index.html";
    }

//adds a contact to the database using AddContact API
    function addContact() {
        // Get values from contacts HTML
        let first = document.getElementById("addFirst").value;
        let last = document.getElementById("addLast").value;
        let email = document.getElementById("addEmail").value;
        let phone = document.getElementById("addPhone").value;

        document.getElementById("contactAddResult").innerHTML = "";

        let validEmail = validateEmail(email);
        if (!validEmail) {
            document.getElementById("contactAddResult").innerHTML = "Invalid Email Address.";
            return;
        }

        let validPhone = validatePhoneNumber(phone);
        if (!validPhone) {
            document.getElementById("contactAddResult").innerHTML = "Invalid Phone Number.";
            return;
        }
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
        try {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("contactAddResult").innerHTML = "Contact has been added";
                }
            };
            xhr.send(jsonPayload);
        } catch (err) {
            document.getElementById("contactAddResult").innerHTML = err.message;
        }

    }

    function searchContact()
    {
        const srch = document.getElementById("searchText").value.trim(); // Get text from search bar
        const resultDiv = document.getElementById("contactSearchResult"); // Space to display search results
        const resultsContainer = document.getElementById("contactResults"); // Space to display contacts

        resultDiv.innerHTML = "";
        resultsContainer.innerHTML = "";

        const headers = ["First", "Last", "Phone", "Email", "", ""];
        headers.forEach(header => {
            const headerDiv = document.createElement("div");
            headerDiv.className = "grid-header";
            headerDiv.textContent = header;
            resultsContainer.appendChild(headerDiv);
        });

        if (srch === "") // Nothing in search bar
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

        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const res = JSON.parse(xhr.responseText);

                if (res.error !== "") // If there is an error
                {
                    resultDiv.innerHTML = res.error; // Display the error
                    return;
                }

                res["Relevant Contacts"].forEach(contact => {
                    // Add the 4 data cells
                    ["FirstName", "LastName", "Phone", "Email"].forEach(key => {
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

            xhr.send(jsonPayload);
        }
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

function deleteContact()
{

}

function editContact()
{

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