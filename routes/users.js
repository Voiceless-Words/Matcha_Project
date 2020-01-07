const router = require('express').Router();
const bcrypt = require('bcrypt-nodejs');
const tokenGen = require('uuid-token-generator');
const dotenv = require('dotenv').config();
const Users = require('../models/users');
const commonFunction = require('./commonFunctions');

//recover Password
router.get('/recover', function(req, res){
    res.render('forgot', {message: "hello"});
});
  
//login route
router.get('/login', function(req, res){
    res.render('login', {message: "hello"});
});
    
//sign up route
router.get('/sign_up', function(req, res){
    res.render('sign_up', {message:"hello"});
});

//resend the verify link
router.get('/resend', function(req, res){
    res.render('resend', {message: "hello"});
});

//verify the account
router.get('/verify', function(req, res){
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

//change Password
router.get('/change', function(req, res){
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

//changing the password
router.post('/change', function(req, res){
  console.log(req.body.username);
  let val;
  bcrypt.genSalt(process.env.SALT_FACTOR, function(err, salt){
      if (err){
        console.log(err);
      }else {
      bcrypt.hash(req.body.password, salt, null, function(err, hash){
          if (err) {
            console.log(err);
          }else {
            val = hash;
            console.log(val);
            Users.findOneAndUpdate({'username': req.body.username}, {'password': val}, {upsert: true}, function(err, doc){
              if (err) {
                console.log(err);
              }else {
                console.log(doc);
              }
            });
          }
      });
    }
  });
  res.render('login', {message: "Password was successfully changed, you may now login"});
});

//resend the verify email link
router.post('/resend', function(req, res){
  Users.findOne({'email': req.body.email}, function(err, user){
    if (err){
      console.log(err);
      return ;
    }else if (user) {
      const tokgen = new tokenGen(256, tokenGen.BASE62);
      let tkn = tokgen.generate();
      if (user.status == "0"){
        Users.findOneAndUpdate({'email': req.body.email}, {'token': tkn}, {upsert: true}, function(err, doc){
          if(err){
            console.log(err);
          }else {
            console.log(doc);
          }
        });

        commonFunction.sendEmail(req.body.email, "Verify your account",
         '<a href="http://localhost:3000/verify?token='+ tkn + '">Click Here</a>');

        res.render('resend', {message: "The veriry link was sent to your email"});
      }else {
      res.render('resend', {message: "Please login if you forgot password reset"});
      }
    }else {
      res.render('resend', {message: "The user does not exist"});
    }
  });
});
  
//sign up post
router.post('api/register', function(req, res){
  
    if (req.body.fname && req.body.lname && req.body.username && req.body.email && req.body.password && req.body.age){
      Users.findOne({'username': req.body.username}, function(err, user){
        if (err)
        {
          console.log(err);
        }else{
          if (!user){
            Users.findOne({'email': req.body.email}, function(err, user1){
              if(err){
                console.log(err);
                res.status(400).send({"User": "Could not connect to the database"});
              }else {
                console.log(user1);
                if (!user1){
                  const tokgen = new tokenGen(256, tokenGen.BASE62);
                  let tkn = tokgen.generate();
                  let user = {
                  firstname: req.body.fname,
                  lastname: req.body.lname,
                  age: req.body.age,
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
                          commonFunction.sendEmail(req.body.email, "Verify your account",
                          '<a href="http://localhost:3000/verify?token='+ tkn + '">Click Here</a>');
                         res.status(200).send(doc);
                      }
                  });
                }else {
                  res.status(400).send({"User": "Email already exists"});
                }
              }
              });
              }else {
                res.status(400).send({"User": "Username already exists"});
                }
            }
            });
    }else {
      res.status(400).send({"User": "PLease make sure that all the required field are filled"});
    }
});
  
//forgot password
router.post('/forgot', function(req, res){
    Users.findOne({'email': req.body.email}, function(err, user){
      if (err){
        console.log(err);
        return ;
      }else if (user) {
        const tokgen = new tokenGen(256, tokenGen.BASE62);
        let tkn = tokgen.generate();
        if (user.status !== "0"){
          Users.findOneAndUpdate({'email': req.body.email}, {'token': tkn}, {upsert: true}, function(err, doc){
            if(err){
              console.log(err);
            }else {
              console.log(doc);
            }
          });
          commonFunction.sendEmail(req.body.email, "Change Account Password",
          '<a href="http://localhost:3000/users/change?token='+ tkn + '">Click Here</a>');
          res.render('forgot', {message: "The link to change password is sent to your email"});
        }else {
        res.render('forgot', {message: "Verify"});
        }
      }else {
        res.render('forgot', {message: "The user does not exist"});
      }
    });
});
  
//login into the app
router.post('/login', function(req, res){
    Users.findOne({$or:[{'username': req.body.username}, {'email': req.body.username}]}, function(err, user){
      if(err){
        console.log(err);
        res.render('login', {message: "Make sure that you are connected to the internet"});
      }else {
        if(user){
          bcrypt.compare(req.body.password, user.password, function(err, response){
            if (err){
              console.log("eroooooor",err);
              console.log("Database - ",user.password, " Home ", req.body.password);
              res.render('login', {message: "Make sure you are connected to the internet"});
            }else if (response == true){
              if (user.status == "1"){
                Users.findOneAndUpdate({'username': user.username}, {'status': "2"}, {upsert: true}, function(err, doc){
                  if(err){
                    console.log(err);
                  }else {
                    console.log(doc + " updated the status");
                  }
                });
                req.session.user = user;
                res.redirect('/welcome');
              }else{
                req.session.user = user;
                res.redirect('/home');
            }
            }else if (response == false){
              res.render('login', {message: "Wrong Password enter the right password or reset if you forgot"});
            }
          });
        }else {
          res.render('login', {message: "The user does not exists please sign up"});
        }
        console.log(user);
      }
    });
      console.log("let's now login");
      //res.end();
});
  
 module.exports = router;