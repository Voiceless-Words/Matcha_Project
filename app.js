const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

//DB connect
mongoose.set('useCreateIndex', true);
let db = mongoose.connect("mongodb+srv://hyper:"+process.env.DB_PASSWORD+"@matchacluster-e6mcr.mongodb.net/Matcha?retryWrites=true", {useNewUrlParser: true});
let Users = require('./models/users');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    /*Users.find({}, function(err, users){
        if(err)
        {
            console.log(err);
        }else{
            res.render('index', {
                title: 'Users',
                users : users
            });
        }
    });*/
    res.render('index');
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
