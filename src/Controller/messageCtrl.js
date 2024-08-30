const path = require('path')
const fs = require('fs')
const { v4 } = require('uuid')

const Chat = require('../Model/chatModel');
const Message = require('../Model/messageModel');

const messageCtrl = {
    // create message
    createMessage: async (req, res) => {
        try {
            const { chatId, senderId } = req.body
            if (!chatId || !senderId) {
                return res.status(201).send({ message: 'invali credentials' })
            }
            if (req.files) {
                const { image } = req.files;
                const format = path.extname(image.name);
                if (format !== ".png" && format !== ".jpg" && format !== ".jpeg") {
                    return res.status(403).send({ message: 'File format is incorrect. Correct format: jpg or png' })
                }
                const nameImg = v4() + format;
                image.mv(path.join(__dirname, "../", "public", nameImg), (err) => {                    
                    if (err) throw err
                })
                req.body.file = nameImg;
            }

            const message = new Message(req.body)
            await message.save()
            res.status(201).send({ message: 'new message', message })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },

    // get chat's messages
    getMessages: async (req, res) => {
        try {
            const { chatId } = req.params
            const messages = await Message.find({ chatId })
            res.status(200).send({ message: "chat's messages", messages })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },

    // delete message
    deleteMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            
            const deletedMessage = await Message.findByIdAndDelete(messageId);
            if (deletedMessage) {
                if (deletedMessage.file !== "") {
                    fs.unlink(path.join(__dirname, "../", "public", deletedMessage.file), (err) => {
                        if (err) {
                            return res.status(503).send({ message: err.message });
                        }
                    });
                }
                return res.status(200).send({ message: "Message deleted", deletedMessage });
            }
            res.status(200).send({ message: "Message not found", deletedMessage });
        } catch (error) {
            res.status(503).send({ message: error.message });
        }
    },
    updateMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            const message = await Message.findById(messageId);
            
            if (message.senderId == req.user._id) {
                if (req.files) {
                    if (req.files.file) {
                        const { file } = req.files;
                        const format = file.mimetype.split("/")[1];
                        if (format !== "png" && format !== "jpg" && format !== "jpeg") {
                            return res.status(403).send({ message: "Format is incorrect" });
                        }
                        const nameImg = v4() + format;
                        file.mv(path.join(__dirname, "../", "public", nameImg), (err) => {
                            if (err) {
                                res.status(503).send(err.message);
                            }
                        });
                        req.body.file = nameImg;

                        if (message.file) {
                            fs.unlink(path.join(__dirname, "../", "public", message.file), (err) => {
                                if (err) {
                                    return res.status(503).send({ message: err.message });
                                }
                            });
                        }
                    }
                }

                const updatedMessage = await Message.findByIdAndUpdate(messageId, req.body, { new: true, });

                if (!updatedMessage) {
                    return res.status(404).send({ message: "Not found" });
                }

                return res.status(200).send({ message: "Updated succesfully", updatedMessage });
            }
        } catch (error) {
            res.status(503).send({message: error.message});
        }
    },
}

module.exports = messageCtrl;