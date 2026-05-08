const express = require('express')
const Router = express.Router()
const User = require('../models/User')
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	limit: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

Router.use(limiter)



cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

Router.post('/signup',async(req,res)=>{
    try
    {
        const user = await User.find({email:req.body.email})
        if (user.length > 0)
        {
            return res.status(500).json({
                msg : 'email already registered'
            })
        }

        const newUser = new User({
            fullName : req.body.fullName,
            email : req.body.email,
            phone : req.body.phone,
            password : null,
            imageId : null,
            imageUrl : null
        })

        if (req.files)
        {
            const uploadedresult = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
            newUser['imageId'] = uploadedresult.public_id,
            newUser['imageUrl'] = uploadedresult.secure_url
        }
        console.log(newUser.imageUrl)

        const hash = await bcrypt.hash(req.body.password,10)
        newUser['password'] = hash
        
        await newUser.save()
        const result = {
            fullName : newUser.fullName,
            email : newUser.email,
            phone : newUser.phone
        }


        res.status(200).json({
            msg :'new user added',
            data : result
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

Router.post('/login',async(req,res)=>{
    try
    {
        const user = await User.find({email:req.body.email})
        if(user.length == 0)
        {
            return res.status(500).json({
                msg : 'email is not registered'
            })
        }
        const verifypass = await bcrypt.compare(req.body.password,user[0].password)
        if (!verifypass)
        {
            return res.status(500).json({
                msg : 'invalid password'
            })
        }
        const token = jwt.sign({
            userId : user[0]._id,
            fullName : user[0].fullName,
            email : user[0].email,
            phone : user[0].phone,
            imageId : user[0].imageId,
            imageUrl : user[0].imageUrl
        },
        process.env.SEC_KEY,
        {
            expiresIn : '24h'
        }
    )
    res.status(200).json({
        token : token
    })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router