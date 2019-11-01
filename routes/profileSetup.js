const router = require('express').Router();
const Users = require('../models/users');
const commonFunction = require('./commonFunctions');


//use welcome page
router.use('/welcome', function(err, req, res, next){
    res.render('login', {message: "Please make sure you are logged in"});
});
  
//use home page
router.use('/home', function(err, req, res, next){
    res.render('login', {message: "Please make sure you are logged in"});
});

//use settings page
router.use('/settings', function(err, req, res, next){
    console.log(err);
    res.render('login', {message: "Please make sure you are logged in"});
});

//posting information on settings
router.post('/setup', function(req, res) {
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

//settings route
router.get('/settings', function(req, res){

    Users.findOne({username:req.session.user.username}, (err, doc) =>{
      if (err){
        console.log("Error trying to find settings", err)
      } else {
        console.log(doc);
        res.render('settings', {user: doc});
      }
    });
  
});

//welcome route
router.get('/welcome', commonFunction.checkSignedIn, function(req, res){
    res.render('welcome',{user: req.session.user});
});

//home route
router.get('/home', commonFunction.checkSignedIn, async function(req, res){

    let interest = commonFunction.interestsIf(req, res);
    let match = [];
    
    console.log("interesss>>>>>>>", interest);
    if (interest.length != 0){
      await Users.find({$and:[{username: {$ne: req.session.user.username}}, {$or : interest}]}, (err, matches) => {
        if (err){
          console.log("When trying to find matches", err);
        }
  
        if (matches.length != 0){
          match = matches;
        }
      });
    }
  
    console.log(match);
    res.render('home', {"match": match});
});

module.exports = router;

  
  