import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, Phone, Video, Info } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import { initiateCall } from '@/redux/callSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`http://localhost:3000/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[]);

    return (
        <div className='flex h-screen w-full'>
            <section className='w-full md:w-[35%] my-8 border-r border-[#2A2850] pr-4'>
                <h1 className='font-bold mb-4 px-3 text-xl text-[#EAEAF0]'>{user?.username}</h1>
                <hr className='mb-4 border-[#2A2850]' />
                <div className='overflow-y-auto h-[80vh]'>
                    {
                        suggestedUsers.map((suggestedUser) => {
                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            return (
                                <div onClick={() => dispatch(setSelectedUser(suggestedUser))} className='flex gap-3 items-center p-3 hover:bg-[#1A1933] rounded-[12px] cursor-pointer transition-all duration-300 mx-2'>
                                    <Avatar className='w-14 h-14 ring-2 ring-[#2A2850] p-[2px]'>
                                        <AvatarImage className="rounded-full" src={suggestedUser?.profilePicture} />
                                        <AvatarFallback className="bg-[#16152a] text-white rounded-full">CN</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-[#EAEAF0]'>{suggestedUser?.username}</span>
                                        <span className={`text-xs font-bold ${isOnline ? 'text-green-500' : 'text-[#A1A1B5]'} `}>{isOnline ? 'online' : 'offline'}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </section>
            {
                selectedUser ? (
                    <section className='flex-1 flex flex-col h-full bg-[#0B0A14]'>
                        <div className='flex justify-between items-center px-3 py-4 border-b border-[#2A2850] sticky top-0 bg-[#16152a]/95 backdrop-blur-md z-10 mx-4 mt-8 rounded-t-[16px]'>
                            <div className='flex gap-3 items-center'>
                                <Avatar className="ring-2 ring-[#2A2850] p-[1px]">
                                    <AvatarImage className="rounded-full" src={selectedUser?.profilePicture} alt='profile' />
                                    <AvatarFallback className="bg-[#16152a] text-white rounded-full">U</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className="font-semibold text-[#EAEAF0]">{selectedUser?.username}</span>
                                </div>
                            </div>
                            <div className='flex items-center gap-4 text-[#CFCFE6]'>
                                <Phone onClick={() => dispatch(initiateCall({ remoteUser: selectedUser }))} className='w-6 h-6 hover:text-green-400 cursor-pointer transition-colors' />
                                <Video onClick={() => dispatch(initiateCall({ remoteUser: selectedUser }))} className='w-6 h-6 hover:text-blue-400 cursor-pointer transition-colors' />
                                <Info className='w-6 h-6 cursor-pointer hover:text-[#EAEAF0]' />
                            </div>
                        </div>
                        <Messages selectedUser={selectedUser} />
                        <div className='flex items-center p-4 border-t border-[#2A2850] mx-4 mb-4 rounded-b-[16px] bg-[#16152a]'>
                            <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className='flex-1 mr-2 focus-visible:ring-transparent bg-[#0B0A14] border-[#2A2850] text-[#EAEAF0] placeholder:text-[#A1A1B5] rounded-[12px]' placeholder="Message..." />
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)} className="bg-gradient-primary text-white font-bold rounded-[12px] hover:scale-105 transition-all w-20">Send</Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center mx-auto'>
                        <MessageCircleCode className='w-32 h-32 my-4 text-[#A1A1B5]' />
                        <h1 className='font-medium text-[#EAEAF0] text-xl'>Your messages</h1>
                        <span className="text-[#A1A1B5]">Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage