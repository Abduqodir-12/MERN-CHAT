const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const http = require('http');
const path = require('path');

dotenv.config()

// routes
const authRouter = require('./src/Router/authRouter')
const userRouter = require('./src/Router/userRouter')
const chatRouter = require('./src/Router/chatRouter')
const messageRouter = require('./src/Router/messageRouter')

const app = express();
const PORT = process.env.PORT || 4001;

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        // origin: "super-chat.netlify.app"
        origin: '*',
        // methods: ['GET', 'POST', 'PUT']
    }
})

// to save files for public
app.use(express.static(path.join(__dirname, 'src', 'public')))

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.use(cors());

// routes usage
app.use('/api/auth', authRouter)
app.use('/api', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)

// socket codes
let activeUsers = [];
io.on('connection', (socket) => {
    socket.on('newUserAdd', (newUserId) => {
        if(!activeUsers.some(user => user === newUserId)) {
            activeUsers.push({userId: newUserId, socketId: socket.id})
        }
        io.emit('getUsers', activeUsers)
    })
    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(user => user.socketId !== socket.id)
        io.emit('getUsers', activeUsers)
    })

    socket.on('exit', (id) => {
        activeUsers.filter(user => user.userId !== id)
        io.emit('getUsers', activeUsers)
    })

    socket.on('sendMessage', (data) => {
        const {receivedId} = data;
        console.log(data);
        const user = activeUsers.find(user => user.userId === receivedId)  
        
        console.log(user);
        
        if(user) {
            io.to(user.socketId).emit("answerMessage", data)
        }
    })
})

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {}).then(() => {
    console.log('Connect to DB');
    server.listen(PORT, () => console.log(`server running on port: ${PORT}`))
}).catch(error => {
    console.log(error);
})