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

    if(username === "test"){
        showUserNameError();
        registerMessage.textContent = "Username Taken";
        registerMessage.style.color = "red";
        return;
    }

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

function showUserNameError(){
    const image = document.getElementById("username-error-img").style.display = "inline";
}

function hideUserNameError(){
    const image = document.getElementById("username-error-img").style.display = "none";
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
    window.location.href = "contact.html";
}

/*
function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";

	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );

				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}

				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}

}
*/

//adds a contact to the database using AddContact API
function addContact()
{
	// Get values from contacts HTML
	let first = document.getElementById("addFirst").value;
	let last = document.getElementById("addLast").value;
	let email = document.getElementById("addEmail").value;
	let phone = document.getElementById("addPhone").value;
	
    document.getElementById("contactAddResult").innerHTML = "";

    let validEmail = validateEmail(email);
    if(!validEmail){
        document.getElementById("contactAddResult").innerHTML = "Invalid Email Address.";
        return;
    }

    let validPhone = validatePhoneNumber(phone);
    if(!validPhone){
        document.getElementById("contactAddResult").innerHTML = "Invalid Phone Number.";
        return;
    }
    phone = normalizePhoneNumber(phone);

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

//NOT FUNCTIONAL YET!
function searchContact()
{
    let srch = document.getElementById("searchText").value.trim();
    let resultDiv = document.getElementById("contactSearchResult");
    let firstRes = document.getElementById("contactSearchResult-First");
    let lastRes = document.getElementById("contactSearchResult-Last");
    let phoneRes = document.getElementById("contactSearchResult-Phone");
    let emailRes = document.getElementById("contactSearchResult-Email");
    resultDiv.innerHTML = "";

    if (srch === "")
    {
        resultDiv.innerHTML = "Please enter a first and last name";
        return;
    }

    let array = srch.split(" ");
    let first = array[0] || "";
    let last  = array[1] || "";

    if (last === "")
    {
        resultDiv.innerHTML = "Please enter both first and last name";
        return;
    }

    let tmp = { firstName: first, lastName: last };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/searchContactFirstNameLastName.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState === 4 && this.status === 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                // Handle server-side error
                if (jsonObject.error && jsonObject.error !== "")
                {
                    resultDiv.innerHTML = jsonObject.error;
                    return;
                }

                // Handle no contact found
                if (!jsonObject.Contact)
                {
                    resultDiv.innerHTML = "No contact found";
                    return;
                }

                // Display contact
                resultDiv.innerHTML = `<Strong>Contact Found</Strong>:`;
            
                firstRes.innerHTML = `${jsonObject.Contact.FirstName}`;
                lastRes.innerHTML = `${jsonObject.Contact.LastName}`;
                phoneRes.innerHTML = `${jsonObject.Contact.Phone}`;
                emailRes.innerHTML = `${jsonObject.Contact.Email}`;
            }
        }

        xhr.send(jsonPayload);
    }
    
    catch (err)
    {
        resultDiv.innerHTML = err.message;
    }
}

function deleteContact()
{

}

function editContact()
{

}