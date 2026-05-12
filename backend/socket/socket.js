import {Server} from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:process.env.URL,
        methods:['GET','POST']
    }
})

const userSocketMap = {} ; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // WebRTC Calling Signaling
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
        const receiverSocketId = userSocketMap[userToCall];
        if(receiverSocketId){
            io.to(receiverSocketId).emit('callUser', { signal: signalData, from, name });
        }
    });

    socket.on('answerCall', (data) => {
        const callerSocketId = userSocketMap[data.to];
        if(callerSocketId){
            io.to(callerSocketId).emit('callAccepted', data.signal);
        }
    });

    socket.on('endCall', ({ to }) => {
        const receiverSocketId = userSocketMap[to];
        if(receiverSocketId){
            io.to(receiverSocketId).emit('callEnded');
        }
    });

    socket.on('disconnect',()=>{
        if(userId){
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
})

export {app, server, io};