var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')
const {engine}=require('express-handlebars')
const cors=require('cors')

require('./helpers/handlebars');
require('dotenv').config(); //require env variables
require('./config/dbconnection'); //database connection
const routerMiddleware = require('./middleware/router');//require route middleware


var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine(
  'hbs',
  engine({
    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir:path.join(__dirname,'views/layouts'),
    partialsDir:path.join(__dirname,'views/partials')
  }),
)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', express.static(path.join(__dirname, 'public')));
app.use('/users/shop', express.static(path.join(__dirname, 'public')));
app.use('/users/moredetails', express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: process.env.SESSION_KEY,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(routerMiddleware());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
