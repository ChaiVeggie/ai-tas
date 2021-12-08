class Auth {
    constructor() {
        document.querySelector("body").style.display = "none";
        
        const user = localStorage.getItem("user");
        this.validateAuth(user);

        /*
        var cookie = document.cookie
                .split(';')
                .map(cookie => cookie.split('='))
                .reduce((accumulator, [key, value]) => ({ ...accumulator, [key.trim()]: decodeURIComponent(value) }), {});
        */
        //this.validateAuth(cookie);
            
    }

    //check if there is token
    validateAuth(user) {
        if (user == null) {
            //console.log("No token");
            window.location.replace("login.html");
        }
        else {
            document.querySelector("body").style.display = "block";
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('fullname');
        localStorage.removeItem('email');
        localStorage.removeItem('sid');
        window.location.replace("/");
    }
}
const auth = new Auth();