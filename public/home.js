function signUp(){
    var login = document.getElementById("login");
    var register  = document.getElementById("register");
    var canvas = document.getElementById("myCanvas");
    var questions = document.getElementById("questions");

    questions.style.display = 'none';
    canvas.style.display = 'none';
    register.style.display = 'block';
    login.style.display = 'none';
}

function login(){
    var login = document.getElementById("login");
    var register  = document.getElementById("register");
    var canvas = document.getElementById("myCanvas");
    var questions = document.getElementById("questions");

    questions.style.display = 'none';
    canvas.style.display = 'none';
    register.style.display = 'none';
    login.style.display = 'block';
}

function questions(){
    var login = document.getElementById("login");
    var register  = document.getElementById("register");
    var canvas = document.getElementById("myCanvas");
    var questions = document.getElementById("questions");

    questions.style.display = 'block';
    canvas.style.display = 'block';
    register.style.display = 'none';
    login.style.display = 'none';

}

function home(){
    var login = document.getElementById("login");
    var register  = document.getElementById("register");
    var canvas = document.getElementById("myCanvas");
    var questions = document.getElementById("questions");

    questions.style.display = 'none';
    canvas.style.display = 'block';
    register.style.display = 'none';
    login.style.display = 'none';
}