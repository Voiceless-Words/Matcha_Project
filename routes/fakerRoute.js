const faker = require('faker');
const router = require('express').Router();
const Users = require('../models/users');

router.get('/addusers', function(req, res){
    
    //generate data
    let genders = [ 'Female' , 'Male', 'Other' ];
    let genderPreference = [ 'Female' , 'Male', 'Both'];
    var gender;

    for(var i = 0; i < 30; i++)
    {
        var j = 0;
        var interests = [];
        /*while (j < 3){
          var item = faker.random.arrayElement(helper.interests());
          if (interests.indexOf(item) == -1){
            interests.push(item);
            j++;
          }
        }*/      
        gender = faker.random.arrayElement(genders);
        sexuality = faker.random.arrayElement(genderPreference);
        // console.log("++++++++++++++++++++> " + sexuality);
        new_user = {
            firstname : faker.name.firstName(gender),
            lastname : faker.name.lastName(),
            email : faker.internet.email(),
            username : faker.internet.userName(),
            age : faker.random.number({'min': 16, 'max': 50}),
            gender : gender,
            bio : faker.lorem.sentence(),
            password : 'Password@1',
            // security_key : key,
            longitude : faker.address.longitude(),
            latitude : faker.address.latitude(),
            pic : faker.internet.avatar(gender),
            interests : interests,
            genderPreference: sexuality,
            status : "2",
            date : String( new Date()),
            active : 1
        };

        // console.log(new_user);
         Users.create( new_user, function(err, doc) {
            // console.log(doc);
            /*var history = new History({
              userId: doc._id,
              likes: [],
              views: []
            });
            history.save(function (err) {
            if (err) console.log(err);
            });*/
              if (err){
                console.log(err);
              }
         });
    }
    res.send("done");
});

router.get('/delete', (req, res) => {
Users.deleteMany({bio: {$ne: ""}}, (err, docs) => {
    if (err){
    console.log("While trying to delete", err);
    }
});
});
  module.exports = router;