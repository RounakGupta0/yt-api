const express = require('express')
const Router = express.Router()
const Comment = require('../models/Comment')
const User = require('../models/User')
const Video = require('../models/Video')
//const cloudinary = require('cloudinary').v2
const jwt = require('jsonwebtoken')

// cloudinary.config({
//     cloud_name:process.env.CLOUD_NAME,
//     api_key:process.env.API_KEY,
//     api_secret : process.env.API_SECRET
// })

// add comments on a video
Router.post('/add-comment/:videoid',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)  
        //console.log(req.body.comment)
        const Acomment = new Comment({
            commentText : req.body.comment,
            userId : tokenData.userId,
            videoId : req.params.videoid
        })

        const newcomment = await Acomment.save()
        res.status(200).json({
            msg:'comments added',
            data : newcomment
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

// get all comments of a video 
Router.get('/:videoId',async(req,res)=>{
    try
    {
        const comments = await Comment.find({videoId : req.params.videoId}).select('commentText likeCount dislikeCount publishedAt').populate('userId','fullName imageUrl')
        res.status(200).json({
            data : comments
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

// get all comments of a user of the particular video
Router.get('/:UserId/:videoId',async(req,res)=>{
    try
    {
        const comments = await Comment.find({userId : req.params.UserId, videoId: req.params.videoId}).select('commentText likeCount dislikeCount publishedAt').populate('userId','fullName imageUrl')
        res.status(200).json({
            data : comments
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

// like on a particular comment
Router.post('/likeonComment/:commentId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)  
        const comment = await Comment.findById(req.params.commentId)
        //console.log(comment)
        const userId = tokenData.userId

        const IsLiked = comment.likedBy.includes(userId)
        //console.log(IsLiked)
        if (IsLiked)
        {
            //unlike
            comment.likedBy = comment.likedBy.filter(uId => uId !=userId)
            comment.likeCount -=1
            //console.log('unlike hua')
        }
        else
        {
            //like
            comment.likedBy.push(userId)
            comment.likeCount +=1
            //console.log('like hua')
        }
        //console.log('hiiiiiii')
        await comment.save()

        res.status(200).json({
            likescount : comment.likeCount
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

//dislike on a comment 

Router.post('/dislikeonComment/:commentId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY) 
        const userid = tokenData.userId

        const comment = await Comment.findById(req.params.commentId)
        //console.log(comment)

        const Isdislike = comment.dislikedBy.includes(userid)
        if(Isdislike)
        {
            //remove dislike
            comment.dislikedBy = comment.dislikedBy.filter(uId => uId != userid)
            comment.dislikeCount -=1
        }
        else
        {
            //dislike
            comment.dislikedBy.push(userid)
            comment.dislikeCount +=1
        }

        await comment.save()
        res.status(200).json({
            dislikeCount : comment.dislikeCount
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

// delete comment by id 

Router.delete('/:commentId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        const video = await Video.findById(comment.videoId)

        //console.log(tokenData.userId)
        //console.log(video)
        const tokenUserId = tokenData.userId
        const commenterId = comment.userId
        const videoOwnerId = video.userId

        //console.log('video ka owner', videoOwnerId)
        //console.log('comment krne vala ka id ', commenterId)        
        if (commenterId != tokenUserId && videoOwnerId != tokenUserId)
        {
            console.log('hi',commenterId != tokenUserId)
            console.log('hello',videoOwnerId != tokenUserId)
            return res.status(500).json({
                msg : 'not authorized'
            })
        }

        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({
            msg : 'msg deleted successfully'
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


//update comment
Router.patch('/updateComment/:commentId',async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token,process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        // console.log(comment)
        // console.log(comment.userId)
        // console.log(tokenData.userId)
        if (comment.userId != tokenData.userId)
        {
            return res.status(500).json({
                msg : 'not authorized'
            })
        }

        const newcomment = {
            commentText : req.body.comment
        }

        const updateddocument = await Comment.findByIdAndUpdate(req.params.commentId,newcomment,{new:true})
        //console.log(updateddocument)

        res.status(200).json({
            msg : 'comment updated successfully'
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