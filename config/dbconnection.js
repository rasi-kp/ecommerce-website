const mongoose=require('mongoose');
const logger=require('../util/winston')
require('dotenv').config();
const connect= mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log("connection sucessfully"))
.then(()=>logger.info('connection sucess.'))
.catch((err)=> console.error(err));
