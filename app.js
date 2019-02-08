const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const nodeMailer = require('nodemailer');
const tokenGen = require('uuid-token-generator');

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
secret: process.env.SECRET_IS_MINE, // session secret
resave: false,
saveUninitialized: false
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

//home route
app.get('/home', function(req, res){
  res.render('index');
});

//recover Password
app.get('/recover', function(req, res){
  res.render('forgot', {message: "hello"});
});

//login route
app.get('/login', function(req, res){
  res.render('login', {message: "hello"});
});

//sign up route
app.get('/sign_up', function(req, res){
  res.render('sign_up', {message:"hello"});
});

//resend the verify link
app.get('/resend', function(req, res){
  res.render('resend', {message: "hello"});
});

//verify the account
app.get('/verify', function(req, res){
  Users.findOne({'token': req.query.token}, function(err, user){
    if (err)
    {
      console.log(err);
    }else{
      if (!user){
        res.render('login', {message: "This link has expired"});
      }else{
        Users.findOneAndUpdate({'token': req.query.token}, {'token': "0", 'status': "1"}, {upsert: true}, function(err, doc){
          if(err){
            console.log(err);
          }else {
            console.log("changed" + doc);
          }
        });
        res.render('login', {message: "Your account has been verified you may now login"});
      }
    }
  });
});

//sign up post
app.post('/sign_up', function(req, res){

  if (req.body.first_name && req.body.last_name && req.body.username && req.body.email && req.body.password){
    Users.findOne({'username': req.body.username}, function(err, user){
      if (err)
      {
        console.log(err);
      }else{
        if (!user){
          const tokgen = new tokenGen(256, tokenGen.BASE62);
          let tkn = tokgen.generate();
          let user = {
          firstname: req.body.first_name,
          lastname: req.body.last_name,
          username: req.body.username,
          email: req.body.email,
          token: tkn,
          status: '0',
          password: req.body.password
        };
          Users.create(user, function(err, doc){
              if(err){
                  console.log(err);
              }else{
                let transpoter = nodeMailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 465,
                  secure: true,
                  auth: {
                    user: 'pietthabiso@gmail.com',
                    pass: 'Thabiso1992'
                  },
                  tls: {
                    rejectUnauthorized: false
                  }
                });
                let mailOptions = {
                  from: '"Matcha" <pietthabiso@gmail.com>',
                  to: req.body.email,
                  subject: 'Verify Your Account',
                  text: "Please verify your address",
                  html: '<a href="http://localhost:3000/verify?token='+ tkn + '">Click Here</a>'
                };
                transpoter.sendMail(mailOptions, function(error, info){
                  if (error){
                    return console.log(error);
                  }
                  console.log("Message %s was sent %s", info.messageId, info.response);
                });
                 res.render('sign_up', {message: "The user account was created successfully check email to verify the account"});
              }
          });
        }else {
          res.render('sign_up', {message: "The user already exists"});
        }
    }
    });
  }else {
    res.render('sign_up', {message: "PLease make sure that all the required field are filled"});
  }
});

//forgot password
app.post('/forgot', function(req, res){
  Users.findOne({'email': req.body.email}, function(err, user){
    if (err){
      console.log(err);
      return ;
    }else if (user) {
      const tokgen = new tokenGen(256, tokenGen.BASE62);
      let tkn = tokgen.generate();
      if (user.status !== "0"){
        let transpoter = nodeMailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'pietthabiso@gmail.com',
            pass: 'Thabiso1992'
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        Users.findOneAndUpdate({'email': req.body.email}, {'token': tkn}, {upsert: true}, function(err, doc){
          if(err){
            console.log(err);
          }else {
            console.log(doc);
          }
        });
        let mailOptions = {
          from: '"Matcha" <pietthabiso@gmail.com>',
          to: req.body.email,
          subject: 'Change Account Password',
          html: '<a href="http://localhost:3000/change?token='+ tkn + '">Click Here</a>'
        };
        transpoter.sendMail(mailOptions, function(error, info){
          if (error){
            return console.log(error);
          }
          console.log("Message %s was sent %s", info.messageId, info.response);
        });
        res.render('forgot', {message: "The link to change password is sent to your email"});
      }else {
      res.render('forgot', {message: "Verify"});
      }
    }else {
      res.render('forgot', {message: "The user does not exist"});
    }
  });
});

//change Password
app.get('/change', function(req, res){
  Users.findOne({'token': req.query.token}, function(err, user){
    if (err)
    {
      console.log(err);
    }else{
      if (!user){
        res.render('change', {message: "This link has expired", username: "nothing"});
      }else{
        Users.findOneAndUpdate({'token': req.query.token}, {'token': "0"}, {upsert: true}, function(err, doc){
          if(err){
            console.log(err);
          }else {
            console.log("changed" + doc);
            res.render('change', {message:"hello", username: doc.username});
          }
        });
      }
    }
  });
});

app.post('/change', function(req, res){
  console.log(req.body.username);
  let val;
  bcrypt.genSalt(process.env.SALT_WORK_FACTOR, function(err, salt){
      if (err) return next(err);

      bcrypt.hash(req.body.password, salt, null, function(err, hash){
          if (err) {
            console.log(err);
          }
           val = hash;
      });
  });
  Users.findOneAndUpdate({'username': req.body.username}, {'token': "0", 'password': val}, {upsert: true}, function(err, doc){
    if(err){
      console.log(err);
    }else {
      console.log(doc);
    }
  });
  res.render('login', {message: "Password was successfully changed, you may now login"});
});

//resend the verify email link
app.post('/resend', function(req, res){
  Users.findOne({'email': req.body.email}, function(err, user){
    if (err){
      console.log(err);
      return ;
    }else if (user) {
      const tokgen = new tokenGen(256, tokenGen.BASE62);
      let tkn = tokgen.generate();
      if (user.status == "0"){
        let transpoter = nodeMailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'pietthabiso@gmail.com',
            pass: 'Thabiso1992'
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        Users.findOneAndUpdate({'email': req.body.email}, {'token': tkn}, {upsert: true}, function(err, doc){
          if(err){
            console.log(err);
          }else {
            console.log(doc);
          }
        });
        let mailOptions = {
          from: '"Matcha" <pietthabiso@gmail.com>',
          to: req.body.email,
          subject: 'Verify Your Account',
          html: '<a href="http://localhost:3000/verify?token='+ tkn + '">Click Here</a>'
        };
        transpoter.sendMail(mailOptions, function(error, info){
          if (error){
            return console.log(error);
          }
          console.log("Message %s was sent %s", info.messageId, info.response);
        });
        res.render('resend', {message: "The veriry link was sent to your email"});
      }else {
      res.render('resend', {message: "Please login if you forgot password reset"});
      }
    }else {
      res.render('resend', {message: "The user does not exist"});
    }
  });
});

app.listen(3000, function(){
    console.log("Our server has started on port 3000");
})
