const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const router = require('express').Router();
var registerModel = require('../models/register.model');

router.get('/', (req, res) => {
  res.status(200).json({ data: 'Welcome to Api' });
});

router.post('/register', (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  let registerdata = new registerModel({ name, email, password });

  registerModel.findOne({
    email: registerdata.email
  }, (err, data) => {
    if (data) {
      console.log(data);
      res.status(200).json({ data: `${registerdata.email} Already Exists` });
    } else {
      console.log(data);
      let ciphertext = CryptoJS.AES.encrypt(registerdata.password, process.env.SECRET_KEY); // encrypt password
      // let bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8); //decrypt password
      registerdata.password = ciphertext;
      registerdata.save(registerdata, (err, data) => {
        if (err) {
          console.log(err);
          res.status(401).json({ data: err });
        }
        console.log(data);
      });
      res.status(200).json({ data: 'Registration Successful', datetime: new Date() });
    }
  });

});

router.post('/login', (req, res) => {
  console.log(req.body);
  registerModel.findOne({
    email: req.body.email
  }, (err, data) => {
    if (!data) {
      res.status(401).json({ data: "Email Does Not Exist" });
    } else if (CryptoJS.AES.decrypt(data.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8) == req.body.password) {
      // let password = CryptoJS.AES.decrypt(data.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

      let token = jwt.sign({
        email: data.email,
        name: data.name,
        password: data.password
      }, process.env.SECRET_KEY, { expiresIn: '1h' })

      registerModel.update({
        email: data.email
      }, {
          $set: { token: token }
        }, (err, d) => {
          if (err) console.log('err', err);
        }
      );

      res.status(200).json({ data: "Login Successful", token, datetime: new Date(});
    } else {
      res.status(401).json({ data: 'Password Incorrect' });
    }
  });

});

module.exports = router;
