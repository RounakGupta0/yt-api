require('dotenv').config();
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userroute = require('./routes/user')
const videoroute = require('./routes/video')
const commentroute = require('./routes/comment')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')



const connectWithDatabase = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("connected with database")
    }
    catch(err)
    {
        console.log("something is wrong")
        console.log(err)
    }
}
connectWithDatabase()

app.use(fileupload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}))

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use('/user',userroute)
app.use('/video',videoroute)
app.use('/comment',commentroute)


module.exports = app