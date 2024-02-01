// routerMiddleware.js
const express = require('express');

const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const adminRouter = require('../routes/admin');

const routerMiddleware = () => {
  const router = express.Router();

  router.use('/', indexRouter);
  router.use('/users', usersRouter);
  router.use('/admin', adminRouter);

  return router;
};

module.exports = routerMiddleware;
