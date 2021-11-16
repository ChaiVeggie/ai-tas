class Auth {
    constructor(){
        document.querySelector("body").style.display = "none";
        const token = localStorage.getItem("token");
        this.validateAuth(token);
    }

    //check if there is token
    validateAuth(token){
        if (!token) {
            //console.log("No token");
            window.location.replace("login.html");
        }
        else{
            document.querySelector("body").style.display = "block";
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace("/");
    }
}
const auth = new Auth();