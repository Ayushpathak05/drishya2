import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socketConnection";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { messages } = useSelector(store => store.chat);
    useEffect(() => {
        const socket = getSocket();
        socket?.on('newMessage', (newMessage) => {
            dispatch(setMessages([...messages, newMessage]));
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [messages, dispatch]);
};
export default useGetRTM;