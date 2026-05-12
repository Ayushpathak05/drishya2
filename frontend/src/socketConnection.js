import { io } from "socket.io-client";
import { API_BASE_URL } from "./lib/api";

let socketInstance = null;

export const initSocket = (userId) => {
    if (!socketInstance) {
        socketInstance = io(API_BASE_URL, {
            query: {
                userId: userId
            },
            transports: ['websocket', 'polling'],
            withCredentials: true,
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
