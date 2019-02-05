const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');

//DB connect
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb+srv://hyper:"+process.env.DB_PASSWORD+"@matchacluster-e6mcr.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, function(err, db){
  if (err)
  {
    console.log(err);
    console.log("unable to start the server");
  }else {
    console.log("Connected to server Successfully!!");
  }
});
let Users = require('./models/users');

const app = express();

app.use(session({
secret: 'botnyuserdetails', // session secret
resave: true,
saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.render('index');
});

function checkSignIn(req, res){
  if (req.session.user){
    next();
  }else {
    var err = new Error("You are not logged in Dumb Ass");
    console.log(req.session.user);
    next(err);
  }
}

app.get('/home', checkSignIn, function(req, res){
  res.render('/home', {username: req.session.user.username});
})

app.post('/login', function(req, res){
  if(!req.body.username || !req.body.password){
    res.render('index', {message:"Please enter both username and password"});
  }else {
    Users.findOne({'username': req.body.username}, function(err, user){
      if (err)
      {
        console.log(err);
      }else{
        console.log(user);
        bcrypt.compare(req.body.password, user.password, function(err, res){
          if (err){
            console.log(err);
          }
        });
        req.session.user = user;
        res.redirect('home');
    }
    });
    res.render('index', {message: "Invalid credentials Dumb ass"});
  }
});

app.get('logout', function(req, res){
  req.session.destroy(function(){
    console.log("You logged out sir");
  });
  res.redirect('index');
});

app.use('/home', function(err, req, res, next){
  console.log(err);
  res.redirect('/index');
});

//sign up post
app.post('/sign_up', function(req, res){
    let user = {
    firstname: req.body.first_name,
    lastname: req.body.last_name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };
    Users.create(user, function(err, doc){
        if(err){
            console.log(err);
        }else{
           console.log(doc);
           res.render('index');
        }
    });
});

app.listen(3000, function(){
    console.log("Our server has started on port 3000");
})
