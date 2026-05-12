import { io } from "socket.io-client";

let socketInstance = null;

export const initSocket = (userId) => {
    if (!socketInstance) {
        socketInstance = io('http://localhost:3000', {
            query: {
                userId: userId
            },
            transports: ['websocket']
        });
    }
    return socketInstance;
};

export const getSocket = () => {
    return socketInstance;
};

export const closeSocket = () => {
    if (socketInstance) {
        socketInstance.close();
        socketInstance = null;
    }
};
