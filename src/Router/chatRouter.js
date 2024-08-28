const express = require('express');
const chatCtrl = require('../Controller/chatCtrl');
const { authMiddleware } = require('../middleware/authMiddleware');

const chatRouter = express.Router();

chatRouter.get('/:firstId/:secondId', authMiddleware, chatCtrl.createChat)
chatRouter.get('/', authMiddleware, chatCtrl.userChats)
chatRouter.delete('/:chatId', authMiddleware, chatCtrl.deleteChat)

module.exports = chatRouter;