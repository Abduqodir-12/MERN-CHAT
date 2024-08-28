const userRouter = require('express').Router();
const userCtrl = require('../Controller/userCtrl');
const { authMiddleware } = require('../middleware/authMiddleware');

userRouter.get('/user/all', userCtrl.getAllUsers);
userRouter.delete('/user/:id', authMiddleware, userCtrl.deleteUser);
userRouter.put('/user/:id', authMiddleware, userCtrl.updateUser);
userRouter.get('/user/:id', userCtrl.getOneUser);

module.exports = userRouter;