var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const wtm=require('./wtm');
let webthings=require('./models/webthing.js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
let obj={};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

obj.configPath="";
obj.rootPath="public/";
webthings.initThings().then(function(){
	wtm.mkdirFloder(obj).then(function(){
		wtm.init(obj).then(function(){
			wtm.adjust(obj).then(function(path){
			});
		});
	});
});


module.exports = app;
