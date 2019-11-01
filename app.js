const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const usersRoute = require('./routes/users');
const fakerRoute = require('./routes/fakerRoute');
const profileRoute = require('./routes/profileSetup');
const session = require('express-session');

//DB connect
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb+srv://hyper:thabisoPassword@matchacluster-e6mcr.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, function(err, db){
  if (err)
  {
    console.log(err);
    console.log("unable to start the server");
  }else {
    console.log("Connected to server Successfully!!");
  }
});


const app = express();

app.use(session({
secret: process.env.SECRET, // session secret
resave: false,
saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.render('index');
});

//users routes controller
app.use('/', usersRoute);

//profile setup and match routes controller
app.use('/', profileRoute);

//fake users routes controller
app.use('/fake', fakerRoute);

//logout route
app.get('/logout', function(req, res){
  req.session.destroy(function(){
    console.log("User logged Out");
    res.render('login', {message: "User logged out"});
  });
});

app.listen(3000, function(){
    console.log("Our server has started on port 3000");
});

app.use(function(req, res) {
    res.redirect('/');
});
