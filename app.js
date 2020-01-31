require('dotenv').config();

var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var http = require('http')
var socketIO = require('socket.io');
var logger = require('morgan');
var cors = require('cors')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var verifyToken = require('./routes/auth');
// var SocketManager = require('./socket')

var app = express();
const server = http.createServer(app)
const io = socketIO(server)
require('./socket')(io);

app.set('port', process.env.PORT || 5000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use(function (req, res, next) {
  var allowedOrigins = ['https://server---api.herokuapp.com/', 'http://192.168.1.4:3000', 'http://192.168.1.5:3000', 'http://192.168.1.6:3000', 'http://localhost:3000', 'http://127.0.0.1:3000'];
  var origin = req.headers.origin;
  console.log(origin);
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.use(indexRouter);

app.use('/api', verifyToken, usersRouter);

// io.on('connection', SocketManager)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(app.get('port'), () => console.log(`App running at port ${app.get('port')}`))

module.exports = app;