//$(function(){
  //  $('#icanvas').hide();
//});
/*document.addEventListener('DOMContentLoaded', function(){
    var video = document.getElementById('vid');
    var canvas = document.getElementById('icanvas');
    var context = canvas.getContext('2d');

    video.addEventListener('play', function(){
        draw(this, context, canvas.width, canvas.height);
    }, false);
}, false);

function draw(v, c, w, h){
    if(v.paused || v.ended) return false;
    c.draw(v, 0, 0, w, h);
    setTimeout(draw, 20, v, c, w, h);
}*/

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
