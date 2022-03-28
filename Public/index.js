const registrationForm = document.querySelector("#registration-form");
const loginForm = document.querySelector("#login-form")
const login = body => axios.post('/login', body).then(
    res => {
        console.log(res.data);
        window.location.href = '/upload'
    }).catch((err) => {
        console.log(err);
        alert("Failed to log in");
    });

const register = body => axios.post('/register', body).
    then((res) => {
        console.log(res.data);
        alert("User Registered");
    }).catch((err) => {
        console.log(err)
        alert("Registration Failed");
    })

function loginSubmitHandler(event) {
    event.preventDefault();

    let username = document.querySelector("#username");
    let password = document.querySelector("#password");

    let bodyObj = {
        username: username.value,
        password: password.value
    }

    login(bodyObj);

    username.value = '';
    password.value = '';

}

function registerSubmitHandler(event){
    event.preventDefault();

    let username = document.querySelector("#create-username");
    let firstName = document.querySelector("#first-name");
    let lastName = document.querySelector("#last-name");
    let email = document.querySelector("#email");
    let password1 = document.querySelector("#password1");
    let password2 = document.querySelector("#password2");

    if(password1.value !== password2.value){
        alert("Password don't match");
        return;
    }

    let bodyObj = {
        username: username.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password1.value
    }

    register(bodyObj);

    username.value = '';
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    password1.value = '';
    password2.value = '';
}

// function loadPage(event){
//     event.preventDefault();
//     window.location.href='/upload';
// }

loginForm.addEventListener('submit', loginSubmitHandler);
registrationForm.addEventListener('submit', registerSubmitHandler);
    