//Join the login to the index
const login = document.getElementById("loginBtn");
const username = document.getElementById("username");
const password = document.getElementById("password");
const errorMessage = document.getElementById("errorMsg");
login.addEventListener("click", ()=> {
    if (username.value == "" || password.value=="") {
        errorMessage.innerText = "Missing information";
        setTimeout(()=> {errorMessage.innerText = ""}, 3000);
    } else window.location.href = "game.html";
})