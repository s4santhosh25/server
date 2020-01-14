const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const router = require('express').Router();
const { uuid } = require('uuidv4');
var registerModel = require('../models/register.model');

router.get('/', (req, res) => {
  res.status(200).json({ data: 'Welcome to Api' });
});

router.post('/oauth', (req, res) => {
  try {
    let { token: { name, email, expires_at, imageUrl, access_token } } = req.body;

    let registerdata = new registerModel({ name, email, password: access_token, expires_at, token: access_token, imageUrl });
    registerdata.userId = uuid();

    registerModel.findOne({
      email: registerdata.email
    }, (err, data) => {
      if (data) {
        console.log(data);
        registerModel.update({
          email: registerdata.email
        }, {
            $set: {
              name: registerdata.name,
              email: registerdata.email,
              password: registerdata.password,
              expires_at: registerdata.expires_at,
              token: registerdata.token,
              imageUrl: registerdata.imageUrl
            }
          }, (err, d) => {
            if (err)
              res.status(401).json({ data: err });
          }
        );
        res.status(200).json({ data: { status: 'Registration Successful', token: data.token, expires_at: data.expires_at }, datetime: new Date() });
      } else {
        registerdata.save(registerdata, (err, data) => {
          if (err) {
            console.log(err);
            res.status(401).json({ data: err });
          } else {
            res.status(200).json({ data: { status: 'Registration Successful', token: data.token, expires_at: data.expires_at }, datetime: new Date() });
          }
        });
      }
    });
  }
  catch (e) {
    res.status(401).json({ data: e });
  }
});

router.post('/register', [
  check('name').not().isEmpty().trim().escape(),
  check('name').isLength({ min: 6 }),
  check('email').isEmail(),
  // password must be at least 5 chars long
  check('password').isLength({ min: 6 })
], (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let { name, email, password } = req.body;
  let registerdata = new registerModel({ name, email, password });

  registerModel.findOne({
    email: registerdata.email
  }, (err, data) => {
    if (data) {
      console.log(data);
      registerModel.update({
        email: registerdata.email,
      }, {
          $set: { name: registerdata.name, }
        }, (err, d) => {
          if (err) console.log('err', err);
        }
      );
      res.status(200).json({ data: `${registerdata.email} Already Exists` });
    } else {
      console.log(data);
      let ciphertext = CryptoJS.AES.encrypt(registerdata.password, process.env.SECRET_KEY); // encrypt password
      // let bytes  = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8); //decrypt password
      registerdata.password = ciphertext;
      registerdata.userId = uuid();
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

router.post('/login', [
  check('email').isEmail(),
  check('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
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
        userId: data.userId
      }, process.env.SECRET_KEY, { expiresIn: '1h' })

      registerModel.update({
        email: data.email
      }, {
          $set: { token: token }
        }, (err, d) => {
          if (err) console.log('err', err);
        }
      );

      res.status(200).json({ data: "Login Successful", token, datetime: new Date() });
    } else {
      res.status(401).json({ data: 'Password Incorrect' });
    }
  });

});

module.exports = router;
