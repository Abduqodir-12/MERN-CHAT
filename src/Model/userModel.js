const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: Number,
            default: 100,
            enum: [100, 101], // 100-oddiy user, 101-admin
        },
        profilePicture: {
            type: String,
            default: ""
        },
        coverPicture: {
            type: String,
            default: ""
        },
        about: String,
        livesIn: String,
        country: String,
        works: String,
        relationShip: String,
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('User', userSchema);