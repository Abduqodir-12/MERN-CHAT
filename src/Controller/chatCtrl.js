const fs = require('fs');
const path = require('path');

const Chat = require('../Model/chatModel');
const Message = require('../Model/messageModel');

const chatCtrl = {
    // create or find chat
    createChat: async (req, res) => {
        try {
            const {firstId, secondId} = req.params;
            const chat = await Chat.findOne({members: {$all: [firstId, secondId]}})
            if(chat) {
                return res.status(200).send({message: 'found chat', chat})
            }
            const newChat = await Chat({members: [firstId, secondId]})
            await newChat.save()
            res.status(201).send({message: 'Found chat', chat: newChat})
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    // chat list
    userChats: async (req, res) => {
        try {
            const {_id} = req.user;
            const chats = await Chat.find({members: {$in: [_id]}})
            res.status(200).send({message: 'Users chats', chats})
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    // delete chat
    deleteChat: async (req, res) => {
        const { chatId } = req.params;
        try {
            const chat = await Chat.findById(chatId);
            if (chat) {
                (await Message.find({ chatId: chat._id })).forEach((message) => {
                    if (message.file) {
                        fs.unlinkSync(path.join(__dirname, "../", "public", message.file), (err) => {
                            if (err) {
                                return res.status(503).send({ message: err.message });
                            }
                        });
                    }
                });
                await Message.deleteMany({ chatId: chat._id });
                await Chat.findByIdAndDelete(chat._id);
                return res.status(200).send({ message: "chat deleted successfully" });
            }
            res.status(404).send({ message: "Chat not foud" });
        } catch (error) {
            res.status(503).send({ message: error.message });
        }
    }
}

module.exports = chatCtrl;