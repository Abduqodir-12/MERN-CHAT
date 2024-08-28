const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        default: "",
    },
    isRead: {
        type: Boolean,
        default: false,
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Message', messageSchema);