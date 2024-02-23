// routerMiddleware.js
const express = require('express');

const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const adminRouter = require('../routes/admin');
const flutterRouter = require('../routes/flutter');


const routerMiddleware = () => {
  const router = express.Router();

  router.use('/', indexRouter);
  router.use('/users', usersRouter);
  router.use('/admin', adminRouter);
  router.use('/flutter', flutterRouter);

  return router;
};

module.exports = routerMiddleware;
