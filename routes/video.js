const express = require('express')
const Router = express.Router()
const Video = require('../models/Video')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const User = require('../models/User')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

Router.post('/upload',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        if (!req.files || !req.files.video)
        {
            return res.status(500).json({
                msg : 'no video found'
            })
        }

        const videoUploaded = await cloudinary.uploader.upload(req.files.video.tempFilePath,
            {
                folder: 'youtube/videos',
                resource_type: 'video'
            }
        )

        let thumbnailId = null
        let thumbnailUrl = null

        if (req.files.thumbnail)
        {
            const thumbnailUploaded = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath,
            {
                folder: 'youtube/image',
                resource_type: 'image'
            }
        )
        thumbnailId = thumbnailUploaded['public_id'],
        thumbnailUrl = thumbnailUploaded['secure_url']
        }

        const newVideo = new Video({
            userId : tokenData.userId,
            title : req.body.title,
            description : req.body.description,
            thumbnailId,
            thumbnailUrl,
            videoId : videoUploaded.public_id,
            videoUrl : videoUploaded.secure_url,
            tags : req.body.tags,
            category : req.body.category
        })

        const result = await newVideo.save()
        console.log(result)
        res.status(200).json({
            video : result
        })

        
    }
    catch (err) 
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


// get all videos
Router.get('/all-videos',async(req,res)=>{
    try
    {
        const allvideos = await Video.find().select("_id title thumbnailUrl userId publishedAt").populate('userId','fullName imageUrl')
        res.status(200).json({
            data : allvideos
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

// get video by video id 

Router.get('/:id',async(req,res)=>{
    try
    {
        const video = await Video.findById(req.params.id).populate('userId','fullName imageUrl')
        //console.log(video)
        const videocreator = await User.findById(video.userId._id)

        video.viewCount +=1
        await video.save()

        const result = {
            ...video._doc,
           subscribersCount : videocreator.subscribers.length
        }
        // console.log(video)

        res.status(200).json({
            data : result
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})


// delete video by videoid
Router.delete('/:id',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        const video = await Video.findById(req.params.id)
        if (video.userId != tokenData.userId)
        {
            return res.status(500).json({
                msg : 'not Authorised'
            })
        }

        const deletevideo = await cloudinary.uploader.destroy(video.videoId,{
            resource_type:'video'
        })
        if (deletevideo.result != 'ok')
        {
            return console.log('video delete nhi hua')
        }

        const Isdelete = await cloudinary.uploader.destroy(video.thumbnailId)
        console.log(Isdelete)
        await Video.findByIdAndDelete(req.params.id)

        res.status(200).json({
            msg : 'video deleted successfully'
        })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

// get videos by userid
Router.get('/all-videos/:userId',async(req,res)=>{
    try
    {
        const videobyUser = await Video.find({userId : req.params.userId}).select('title thumbnailUrl publishedAt').populate('userId','fullName imageurl')
        res.status(200).json({
            data : videobyUser
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

// like and unlike
Router.post('/likeAndUnlike/:videoId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData.userId

        const video = await Video.findById(req.params.videoId)
        // console.log(video)
        const isLiked = video.likedBy.includes(userId)

        if (isLiked) {
            // unlike
            
            video.likedBy = video.likedBy.filter(uId => uId != userId)
            video.likeCount -= 1
            console.log('unlike hua')
        }
        else {
            video.likedBy.push(userId)
            video.likeCount += 1
            console.log('like hua')
        }
        await video.save()
        res.status(200).json({
            likeCount: video.likeCount
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// dislike and remove dislike api
Router.post('/dislike/:videoId',async(req,res) =>{
    try 
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const userId = tokenData.userId

        const video = await Video.findById(req.params.videoId)
        const Isdisliked = video.dislikedBy.includes(userId)

        if (Isdisliked)
        {
            //remove dislike
            video.dislikedBy = video.dislikedBy.filter(uId => uId != userId)
            video.dislikeCount -=1
        }
        else 
        {
            video.dislikedBy.push(userId)
            video.dislikeCount +=1
        }
        await video.save()
        res.status(200).json({
            dislikeCount : video.dislikeCount
        })

    }
    catch (err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})


// update video details

Router.put('/updateVideo/:videoId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(req.params.videoId)
        if (video.userId != tokenData.userId)
        {
            return res.status(500).json({
                msg : 'not authorized'
            })
        }

        const newvideo = {
            userId : tokenData.userId,
            title : req.body.title,
            description : req.body.description,
            thumbnailId : video.thumbnailId,
            thumbnailUrl : video.thumbnailUrl,
            videoId : video.videoId,
            videoUrl : video.videoUrl,
            tags : req.body.tags,
            category : req.body.category
        }

        if (req.files && req.files.thumbnail)
        {
            await cloudinary.uploader.destroy(video.thumbnailId)
            const newthumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath,
            {
                folder: 'youtube/image',
                resource_type: 'image'
            }
            )
            newvideo['thumbnailId'] = newthumbnail.public_id
            newvideo['thumbnailUrl'] = newthumbnail.secure_url
        }

        const updatedresult = await Video.findByIdAndUpdate(req.params.videoId,newvideo,{new:true})
        console.log(updatedresult)

        res.status(200).json({
            data : updatedresult
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
})

module.exports = Router