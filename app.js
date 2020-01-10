require('dotenv').config();
var express = require('express');
const jwt = require('jsonwebtoken');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var registerModel = require('./models/register.model');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var port = process.env.PORT || 8000;
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//Authenticate
app.use(verifyToken, (req, res, next) => {
  jwt
    .verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
      if (err) {
        res
          .status(200)
          .json({ auth: false, token: req.token, status: 'unauthorized' });
      } else {
        console.log(decoded);
        registerModel.findOne({
          email: decoded.email
        }, (err, data) => {
          if (err)
            console.log('err', err);
          console.log(data);
          if (req.token === data.token) {
            res
              .status(200)
              .json({ auth: true, token: req.token, status: 'authorized' });
          } else {
            res
              .status(200)
              .json({ auth: false, token: req.token, status: 'unauthorized' });
          }
        });
      }
    });
});

function verifyToken(req, res, next) {
  if (req.headers['authorization']) {
    req.token = req
      .headers['authorization']
      .split(' ')[1];
    next();
  } else {
    res
      .status(200)
      .json({ auth: false, token: req.token, status: 'unauthorized' });
  }
}

app.use('/api', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => console.log(`App running at port ${port}`))

module.exports = app;
