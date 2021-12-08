function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    var inputObjectData = {
        "usr": email,
        "pwd": password
    };

    (async () => {
        const response = await fetch('http://localhost:8000/api/method/ai_tas.api.login', {
            method: 'POST',
            body: JSON.stringify(inputObjectData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then((data) => {
                console.log('data: ' + JSON.stringify(data));

                //Store token
                if (data.message.success_key == 0) {
                    document.getElementById('email').value = "";
                    document.getElementById('password').value = "";
                    document.getElementById('authError').style.display = "block";
                }
                else {
                    //successful login

                    //Get the API secret
                    //const token = data.message.api_key + ":" + data.message.api_secret;
                    //localStorage.setItem('token', token);
                    localStorage.setItem('user', data.message.username);
                    localStorage.setItem('fullname', data.full_name);
                    localStorage.setItem('email', data.message.email);
                    localStorage.setItem('sid', data.message.sid);
                    window.location.replace("index.html"); //redirect to index page
                    //console.log(token);
                }
            }).catch(() => {
                //network error
                document.getElementById('email').value = "";
                document.getElementById('password').value = "";
                document.getElementById('authError').style.display = "block";
            });
    })();
}

function hideNotif() {
    document.getElementById('authError').style.display = "none";
}