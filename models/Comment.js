const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({

    text : {type:String},
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    publishedAt : {
        type : Date,
        default : Date.now
    }

},
{
    timestamps : true
}
)



const commentSchema = new mongoose.Schema({

    // kis video par comment hai
    videoId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Video',
        required : true
    },

    // kis user ne comment kiya
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    // comment text
    commentText : {
        type : String,
        required : true,
        trim : true
    },

    // like karne wale users
    likedBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],

    // dislike karne wale users
    dislikedBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],

    likeCount : {
        type : Number,
        default : 0,
        min : 0
    },

    dislikeCount : {
        type : Number,
        default : 0,
        min : 0
    },

    publishedAt : {
        type : Date,
        default : Date.now
    },

    reply : [replySchema]
},
{
    timestamps : true
})

module.exports = mongoose.model('Comment', commentSchema)