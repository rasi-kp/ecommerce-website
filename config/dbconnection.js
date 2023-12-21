const mongoose=require('mongoose');
require('dotenv').config();
const connect= mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log("connection sucessfully"))
.catch((err)=> console.error(err));
