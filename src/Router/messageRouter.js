const express = require('express');
const messageCtrl = require('../Controller/messageCtrl');
const { authMiddleware } = require('../middleware/authMiddleware');

const messageRouter = express.Router();

messageRouter.post('/', authMiddleware, messageCtrl.createMessage)
messageRouter.get('/:chatId', authMiddleware, messageCtrl.getMessages)
messageRouter.delete('/:messageId', authMiddleware, messageCtrl.deleteMessage)
messageRouter.put('/:messageId', authMiddleware, messageCtrl.updateMessage)

module.exports = messageRouter;