import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import logo from '../assets/project icon.png';
import axios from 'axios';
import { setLikeNotification } from '@/redux/rtnSlice';
import { API_BASE_URL } from '@/lib/api';

const TopNavbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const [openLang, setOpenLang] = useState(false);
    const [openNotif, setOpenNotif] = useState(false);
    
    // Language Preference State
    const [language, setLanguage] = useState(localStorage.getItem('preferred_language') || 'English');

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('preferred_language', lang);
        setOpenLang(false);
        // Can dispatch to redux if we have a global preferences state
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/notification`, { withCredentials: true });
            if (res.data.success) {
                // map DB notifications to state logic
                const formatted = res.data.notifications.map(n => ({
                    _id: n._id,
                    type: n.type,
                    userId: n.sender._id,
                    userDetails: {
                        username: n.sender.username,
                        profilePicture: n.sender.profilePicture
                    },
                    message: n.message,
                    read: n.read,
                    postId: n.post
                }));
                // We overwrite the active array so it acts as history
                dispatch(setLikeNotification(formatted));
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleReadNotifications = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/notification/read`, {}, { withCredentials: true });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='md:hidden fixed top-0 w-full z-50 bg-[#16152a]/70 backdrop-blur-[12px] border-b border-[#2A2850] shadow-depth flex justify-between items-center px-4 h-14 transition-all duration-300'>
            <div className='flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-1' onClick={() => navigate("/")}>
                <img src={logo} alt="Drishya Logo" className='w-7 h-7' />
                <h1 className='font-bold text-xl text-primary font-outfit tracking-wide drop-shadow-lg'>Drishya</h1>
            </div>
            
            <div className='flex items-center gap-4'>
                {/* Language Selector */}
                <Popover open={openLang} onOpenChange={setOpenLang}>
                    <PopoverTrigger asChild>
                        <div className="cursor-pointer flex items-center gap-1 group">
                            <Globe className="w-5 h-5 group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-accent transition-all duration-300 text-secondary" />
                            <span className="text-xs font-semibold hidden sm:block text-secondary group-hover:text-accent transition-colors">{language.substring(0, 2)}</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 z-50 mt-2 right-0 origin-top-right p-2 rounded-[16px] shadow-depth border border-[#2A2850] bg-[#16152a]/95 backdrop-blur-2xl">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-gray-500 mb-1 px-2">Content Language</p>
                            {['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'].map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${language === lang ? 'bg-[rgba(255,153,51,0.2)] text-[#FF9933] font-semibold' : 'hover:bg-[rgba(255,153,51,0.12)] text-[#EAEAF0] hover:text-[#FF9933]'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Notifications */}
                <Popover open={openNotif} onOpenChange={(val) => {
                    setOpenNotif(val);
                    if (val) handleReadNotifications();
                }}>
                    <PopoverTrigger asChild>
                        <div className="relative cursor-pointer group">
                            <Heart className="w-6 h-6 group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-sindoor transition-all duration-300 text-[#CFCFE6]" />
                            {likeNotification?.filter(n => !n.read)?.length > 0 && (
                                <span className="absolute -top-1 -right-2 bg-sindoor shadow-[0_0_10px_rgba(255,87,87,0.8)] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                    {likeNotification.filter(n => !n.read).length}
                                </span>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 z-50 mt-2 right-0 origin-top-right rounded-[16px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-[#2A2850] bg-[#16152a]/95 backdrop-blur-2xl">
                        <div>
                            {likeNotification?.length === 0 ? (<p className="text-[#A1A1B5] text-center font-medium py-4 opacity-100 filter-none">No notifications yet.</p>) : (
                                likeNotification?.map((notification) => (
                                    <div key={notification._id || notification.userId} className='flex items-center gap-3 my-2 p-2 hover:bg-[rgba(255,153,51,0.12)] rounded-[12px] transition-all duration-200 hover:-translate-y-1 cursor-pointer group hover:shadow-[0_0_15px_rgba(255,153,51,0.1)]'>
                                        <Avatar className="ring-2 ring-[#FF9933]/50 p-[1px] bg-gradient-primary">
                                            <AvatarImage className="rounded-full" src={notification.userDetails?.profilePicture} />
                                            <AvatarFallback className="bg-[#16152a] w-full h-full text-white">U</AvatarFallback>
                                        </Avatar>
                                        <div className='flex items-center justify-between w-full'>
                                            <p className='text-sm text-[#EAEAF0] opacity-100 filter-none group-hover:text-[#FF9933]'><span className='font-bold text-[#FF9933]'>{notification.userDetails?.username}</span> {notification.message || 'interacted with you'}</p>
                                            {!notification.read && <div className="w-2 h-2 bg-sindoor rounded-full drop-shadow-[0_0_5px_rgba(255,87,87,0.8)]"></div>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Messages */}
                <MessageCircle onClick={() => navigate("/chat")} className="w-6 h-6 text-[#CFCFE6] cursor-pointer hover:scale-110 hover:-translate-y-2 hover:text-indigo transition-all duration-300" />
            </div>
        </div>
    );
};

export default TopNavbar;
