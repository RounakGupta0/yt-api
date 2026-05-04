const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({

    // 🔹 Basic Info
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 120
    },

    description: {
        type: String,
        default: '',
        maxlength: 5000,
        trim: true
    },

    // 🔹 Media
    videoUrl: {
        type: String,
        required: true,
        trim: true
    },

    videoId: {
        type: String,
        required: true,
        unique: true,
    },

    thumbnailUrl: {
        type: String,
        trim: true
    },

    thumbnailId: {
        type: String
    },

    // 🔹 Owner
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // 🔹 Engagement (separate fields)
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },

    likeCount: {
        type: Number,
        default: 0,
        min : 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    dislikedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    dislikeCount: {
        type: Number,
        default: 0,
        min: 0
    },

    commentCount: {
        type: Number,
        default: 0,
        min: 0
    },

    // 🔹 Video Details
    duration: {
        type: Number, // seconds
        min: 1
    },

    category: {
        type: String,
        enum: ['education', 'entertainment', 'gaming', 'music', 'tech', 'vlog', 'other'],
        default: 'other'
    },

    tags: [
        {
            type: String,
            lowercase: true,
            trim: true
        }
    ],
    // 🕒 Timestamps
    publishedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true // createdAt & updatedAt
})


// 🔥 Text Index for search
//videoSchema.index({ title: 'text', description: 'text', tags: 'text' })


module.exports = mongoose.model('video', videoSchema)