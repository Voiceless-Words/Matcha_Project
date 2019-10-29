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
mongoose.connect("mongodb+srv://hyper:thabisoPassword@matchacluster-e6mcr.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}, function(err, db){
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

function checkSignedIn(req, res, next){
  console.log(req.session.user);
  if(req.session.user){
    next();
  }else{
    let err = new Error("Not logged in!");
    next(err);
  }
}

function interestsIf(req, res){
  let ints = [];

  if (req.session.user.NO == "on"){
    ints.push({NO:"on"});
  }

  if (req.session.user.LP == "on"){
    ints.push({LP:"on"});
  }

  if (req.session.user.LW == "on"){
    ints.push({LW:"on"});
  }

  if (req.session.user.RD == "on"){
    ints.push({RD:"on"});
  }

  if (req.session.user.MV == "on"){
    ints.push({MV:"on"});
  }

  if (req.session.user.SE == "on"){
    ints.push({SE:"on"});
  }

  return ints;
}
//home route
app.get('/home', checkSignedIn, async function(req, res){

  let interest = interestsIf(req, res);
  let match = [];
  
  await Users.find({$and:[{username: {$ne: req.session.user.username}}, {$or : interest}]}, (err, matches) => {
    if (err){
      console.log("When trying to find matches", err);
    }

    if (matches.length != 0){
      match = matches;
    }
  });

  console.log(match);
  res.render('home', {"match": match});
});

//welcome route
app.get('/welcome', checkSignedIn, function(req, res){
  res.render('welcome',{user: req.session.user});
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

//settings route
app.get('/settings', function(req, res){

  Users.findOne({username:req.session.user.username}, (err, doc) =>{
    if (err){
      console.log("Error trying to find settings", err)
    } else {
      console.log(doc);
      res.render('settings', {user: doc});
    }
  });

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
          Users.findOne({'email': req.body.email}, function(err, user1){
            if(err){
              console.log(err);
            }else {
              console.log(user1);
              if (!user1){
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
                          user: process.env.E_MAIL,
                          pass: process.env.SEPHIRI
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
                res.render('sign_up', {message: "The email already exists"});
              }
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
            user: process.env.E_MAIL,
            pass: process.env.SEPHIRI
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

//changing the password
app.post('/change', function(req, res){
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
            user: process.env.E_MAIL,
            pass: process.env.SEPHIRI
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

//login into the app
app.post('/login', function(req, res){
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


//posting information on settings
app.post('/setup', function(req, res) {
  console.log("BODY &&&&&&&&&",req.body);

  const {...updateData } = req.body;
  Users.findOneAndUpdate ({username: req.body.username}, updateData, {new: true}, function(err, doc) {
    if (err)
    {
      console.log("When trying to update", err);
    }
    else {
      res.redirect('/settings');
    }
  });
});


//use welcome page
app.use('/welcome', function(err, req, res, next){
  res.render('login', {message: "Please make sure you are logged in"});
});

//use home page
app.use('/home', function(err, req, res, next){
  res.render('login', {message: "Please make sure you are logged in"});
});

//use settings page
app.use('/settings', function(err, req, res, next){
  console.log(err);
  res.render('login', {message: "Please make sure you are logged in"});
});

//logout route
app.get('/logout', function(req, res){
  req.session.destroy(function(){
    console.log("User logged Out");
    res.render('login', {message: "User logged out"});
  });
});


app.get('/addusers', function(req, res){
  //generate data
  let gender = [ 'female' , 'male', 'other' ];
  let genderPreference = [ 'Female' , 'Male', 'Both'];
  var gender;
  for(var i = 0; i < 30; i++)
  {
      var j = 0;
      var interests = [];
      while (j < 3){
        var item = faker.random.arrayElement(helper.interests());
        if (interests.indexOf(item) == -1){
          interests.push(item);
          j++;
        }
      }
      gender = faker.random.arrayElement(genders);
      sexuality = faker.random.arrayElement(sexual_prefs);
      // console.log("++++++++++++++++++++> " + sexuality);
      new_user = {
          firstName : faker.name.firstName(gender),
          lastName : faker.name.lastName(),
          email : faker.internet.email(),
          username : faker.internet.userName(),
          birthDate :faker.date.between('1930-01-01', '2001-12-31'),
          age : faker.random.number({'min': 16, 'max': 50}),
          gender : gender,
          bio : faker.lorem.sentence(),
          password : 'Password@1',
          // security_key : key,
          loc_long : faker.address.longitude(),
          loc_lati : faker.address.latitude(),
          pic : faker.internet.avatar(gender),
          interests : interests,
          sexuality : sexuality,
          completeProfile : 1,
          verified : 1,
          date : String( new Date()),
          active : 1
      };
      // console.log(new_user);
       User.create( new_user, function(err, doc) {
          // console.log(doc);
          var history = new History({
            userId: doc._id,
            likes: [],
            views: []
          });
          history.save(function (err) {
          if (err) console.log(err);
          });
            if (err){
              console.log(err);
            }
       });
  }
  res.send("done");
})
app.listen(3000, function(){
    console.log("Our server has started on port 3000");
});

app.use(function(req, res) {
    res.redirect('/');
});
