const nodeMailer = require('nodemailer');
const dotenv = require('dotenv').config();

exports.checkSignedIn  = (req, res, next) => {
    console.log(req.session.user);
    if(req.session.user){
      next();
    }else{
    res.render('login', {message: "Please make sure you are logged in"});
    }
}
  
exports.interestsIf = (req, res) => {
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

exports.sendEmail = (email, subject, message) => {

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
        to: email,
        subject: subject,
        html: message
      };
      transpoter.sendMail(mailOptions, function(error, info){
        if (error){
          return console.log(error);
        }
        console.log("Message %s was sent %s", info.messageId, info.response);
      });
}