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
        }).then((response) => {
            //Bad response returned
            if (response.status >= 400 && response.status < 600) {
                throw new Error("Bad response from server");
            }
            return response;
        }).then(response => response.json())
            .then((data) => {
                //successful login
                console.log('data: ' + JSON.stringify(data));
                //console.log(data.message.api_key);

                //Store token
                const token = data.message.api_key + ":" + data.message.api_secret;
                localStorage.setItem('token', token);
                window.location.replace("index.html");
                //console.log(token);
            }).catch((error) => {
                //network error
                document.getElementById('email').value = "";
                document.getElementById('password').value = "";
                console.log(error);
            });
    })();
}