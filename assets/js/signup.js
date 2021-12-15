function validate(name, email, password, confirmPassword) {

    //check empty name field  
    if (name == "") {
        document.getElementById("message").innerHTML = "Please fill in your name";
        return false;
    }

    //check empty email field  
    if (email == "") {
        document.getElementById("message").innerHTML = "Please fill in your email";
        return false;
    }

    //check empty password field  
    if (password == "") {
        document.getElementById("message").innerHTML = "Please fill in your password";
        return false;
    }

    //check empty confirmPassword field  
    if (confirmPassword == "") {
        document.getElementById("message").innerHTML = "Please confirm your password";
        return false;
    }

    //minimum password length validation  
    if (password.length < 8) {
        document.getElementById("message").innerHTML = "Password length must be atleast 8 characters";
        return false;
    }

    //maximum length of password validation  
    if (password.length > 15) {
        document.getElementById("message").innerHTML = "Password length must not exceed 15 characters";
        return false;
    }

    //check password match
    if (password != confirmPassword) {
        document.getElementById("message").innerHTML = "Password did not match";
        return false;
    }
    return true;
}

function signup() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    //validation
    if (validate(name, email, password, confirmPassword) == false) {
        document.getElementById('validationError').style.display = "block";
        return;
    }

    //Disable button so that signup function only run once at a time.
    document.getElementById("signup").disabled = true;

    var inputObjectData = {
        "full_name": name,
        "email": email,
        "new_password": password,
        "redirect_to": "testing"
    };

    (async () => {
        const response = await fetch('http://localhost:8000/api/method/frappe.core.doctype.user.user.sign_up', {
            method: 'POST',
            body: JSON.stringify(inputObjectData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then((data) => {
                console.log('data: ' + JSON.stringify(data));
                // console.log(data.message[0]);

                //Store token
                //if (data.message.success_key == 0) {
                if (data.message[0] == 0) {
                    //console.log("signup failed");
                    document.getElementById('validationError').style.display = "block";
                    document.getElementById("message").innerHTML = "This account is already registered";
                    document.getElementById("signup").disabled = false;
                }
                else {
                    //successful signup
                    window.location.replace("signup-success.html"); //redirect to login page
                }
            }).catch(() => {
                //network error
                document.getElementById('validationError').style.display = "block";
                document.getElementById("message").innerHTML = "Error signing up";
                document.getElementById("signup").disabled = false;
            });
    })();
}

function hideNotif() {
    document.getElementById('validationError').style.display = "none";
}