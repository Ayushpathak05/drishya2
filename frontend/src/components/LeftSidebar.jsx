import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, PlaySquare, Globe, GraduationCap, Trophy } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser, setAppMode } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import CreateReel from './CreateReel'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import logo from '../assets/project icon.png'
import { API_BASE_URL } from '@/lib/api';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, appMode } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [showCreatePicker, setShowCreatePicker] = useState(false);
    const [showCreateReel, setShowCreateReel] = useState(false);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [openLang, setOpenLang] = useState(false);
    const [openNotif, setOpenNotif] = useState(false);
    
    // Language Preference State
    const [language, setLanguage] = useState(localStorage.getItem('preferred_language') || 'English');

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('preferred_language', lang);
        setOpenLang(false);
    };

    const handleReadNotifications = async () => {
        try {
            await axios.post("${API_BASE_URL}/api/v1/notification/read", {}, { withCredentials: true });
        } catch (error) {
            console.log(error);
        }
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get('${API_BASE_URL}/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setShowCreatePicker(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Search') {
            navigate("/search");
        } else if (textType === 'Explore') {
            navigate("/explore");
        } else if (textType === 'Reels') {
            navigate("/reels");
        } else if (textType === 'Notifications') {
            return;
        } else if (textType === 'Campus') {
            navigate('/campus');
        } else if (textType === 'Challenges') {
            navigate('/challenges');
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <PlaySquare />, text: "Reels" }, // Added Reels
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        { icon: <GraduationCap />, text: "Campus" },
        { icon: <Trophy />, text: "Challenges" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed top-0 z-10 left-0 px-4 shadow-sm border-r border-[#2A2850]/50 w-[20%] h-screen bg-[#16152a]/60 backdrop-blur-[16px] font-outfit transition-all duration-300 opacity-95 hover:opacity-100'>
            <div className='flex flex-col h-full'>
                <div className='my-6 pl-3 flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:-translate-y-[2px]' onClick={()=> navigate("/")}>
                    <img src={logo} alt="Project Logo" className='w-8 h-8' />
                    <h1 className='font-bold text-xl text-primary font-outfit tracking-wider shadow-sm'>Drishya</h1>
                </div>


                <div className="flex-1 no-scrollbar mt-2">
                    {
                        sidebarItems.filter(item => {
                            if (appMode === 'for-you') {
                                return item.text !== 'Campus' && item.text !== 'Challenges';
                            }
                            return true;
                        }).map((item, index) => {
                            let isActive = false;
                            if (item.text === 'Home' && location.pathname === '/') isActive = true;
                            if (item.text === 'Search' && location.pathname === '/search') isActive = true;
                            if (item.text === 'Explore' && location.pathname === '/explore') isActive = true;
                            if (item.text === 'Reels' && location.pathname === '/reels') isActive = true;
                            if (item.text === 'Messages' && location.pathname === '/chat') isActive = true;
                            if (item.text === 'Profile' && location.pathname.includes(`/profile/${user?._id}`)) isActive = true;
                            if (item.text === 'Campus' && location.pathname === '/campus') isActive = true;
                            if (item.text === 'Challenges' && location.pathname === '/challenges') isActive = true;

                            const itemContent = (
                                <div onClick={() => { if(item.text !== 'Notifications') sidebarHandler(item.text); }} className={`flex items-center gap-4 relative cursor-pointer rounded-[14px] p-3 my-2 transition-all duration-200 ease-in-out group hover:-translate-y-[2px] shadow-none hover:shadow-[0_0_15px_rgba(255,153,51,0.15)] focus:bg-[rgba(255,153,51,0.18)] focus:font-[500] ${isActive ? 'bg-[rgba(255,153,51,0.18)] font-[500] shadow-[0_0_10px_rgba(255,153,51,0.1)]' : 'hover:bg-[rgba(255,153,51,0.12)]'}`}>
                                    <div className={`transition-colors duration-200 group-hover:scale-110 opacity-100 filter-none ${isActive ? 'text-[#FF9933]' : 'text-[#CFCFE6] group-hover:text-[#FF9933]'}`}>
                                        {item.icon}
                                    </div>
                                    <span className={`font-medium hidden lg:block transition-colors duration-200 opacity-100 filter-none ${isActive ? 'text-[#FF9933]' : 'text-[#EAEAF0] group-hover:text-[#FF9933]'}`}>{item.text}</span>
                                    {
                                        item.text === "Notifications" && likeNotification.filter(n => !n.read).length > 0 && (
                                            <div className="rounded-full h-5 w-5 bg-sindoor absolute bottom-3 left-6 drop-shadow-[0_0_5px_rgba(255,87,87,1)] border border-[#16152a] font-bold text-[10px] text-white z-10 flex items-center justify-center">
                                                {likeNotification.filter(n => !n.read).length}
                                            </div>
                                        )
                                    }
                                </div>
                            );

                            if (item.text === 'Notifications') {
                                return (
                                    <Popover key={index} open={openNotif} onOpenChange={(val) => {
                                        setOpenNotif(val);
                                        if(val) handleReadNotifications();
                                    }}>
                                        <PopoverTrigger asChild>
                                            {itemContent}
                                        </PopoverTrigger>
                                        <PopoverContent className="ml-4 rounded-[16px] shadow-depth border border-[#2A2850] bg-[#16152a]/95 backdrop-blur-md z-50">
                                            <h2 className="sr-only">Notifications</h2>
                                            <div>
                                                {
                                                    likeNotification.length === 0 ? (<p className="text-[#A1A1B5] font-medium opacity-100 filter-none text-center p-2">No notifications yet</p>) : (
                                                        likeNotification.map((notification) => {
                                                            return (
                                                                <div key={notification._id || notification.userId} className='flex items-center gap-3 my-2 p-2 hover:bg-[rgba(255,153,51,0.12)] rounded-[12px] transition-all duration-300 hover:-translate-y-1 cursor-pointer group hover:shadow-[0_0_15px_rgba(255,153,51,0.1)]'>
                                                                    <Avatar className="ring-2 ring-[#FF9933]/50 p-[1px] bg-gradient-primary w-8 h-8">
                                                                        <AvatarImage className="rounded-full border border-[#16152a]" src={notification.userDetails?.profilePicture} />
                                                                        <AvatarFallback className="bg-[#16152a] w-full h-full text-white">U</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className='flex items-center justify-between w-full'>
                                                                        <p className='text-sm text-[#EAEAF0] opacity-100 filter-none group-hover:text-[#FF9933]'><span className='font-bold text-[#FF9933]'>{notification.userDetails?.username}</span> {notification.message || 'interacted with you'}</p>
                                                                        {!notification.read && <div className="w-2 h-2 bg-sindoor rounded-full drop-shadow-[0_0_5px_rgba(255,87,87,0.8)]"></div>}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    )
                                                }
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            }
                            return <div key={index}>{itemContent}</div>;
                        })
                    }
                </div>
                
                {/* Language Selector at bottom of Sidebar */}
                <div className="mb-4">
                    <Popover open={openLang} onOpenChange={setOpenLang}>
                        <PopoverTrigger asChild>
                            <div className='flex items-center gap-3 hover:bg-[rgba(255,153,51,0.12)] cursor-pointer rounded-[14px] p-3 transition-all duration-300 group hover:-translate-y-2 hover:shadow-glow-saffron focus:bg-[rgba(255,153,51,0.18)]'>
                                <Globe className="text-[#CFCFE6] group-hover:text-[#FF9933] group-hover:scale-110 transition-all opacity-100 filter-none" />
                                <span className="font-medium hidden lg:block text-[#EAEAF0] group-hover:text-[#FF9933] transition-colors opacity-100 filter-none">Language: {language.substring(0, 3)}</span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 ml-4 mb-2 p-2 rounded-[16px] shadow-depth border border-[#2A2850] bg-[#16152a]/95 backdrop-blur-2xl">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-bold text-[#A1A1B5] mb-2 px-2">Content Language</p>
                                {['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'].map(lang => (
                                    <Button 
                                        key={lang} 
                                        variant="ghost" 
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`justify-start text-sm hover:bg-[rgba(255,153,51,0.12)] hover:text-[#FF9933] rounded-[12px] opacity-100 filter-none ${language === lang ? 'bg-[rgba(255,153,51,0.18)] text-[#FF9933] font-[500] shadow-[0_0_10px_rgba(255,153,51,0.15)]' : 'text-[#EAEAF0]'}`}
                                    >
                                        {lang}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Create Post */}
            <CreatePost open={open} setOpen={setOpen} />

            {/* Create Reel Modal */}
            {showCreateReel && (
                <CreateReel
                    onClose={() => setShowCreateReel(false)}
                    onReelCreated={() => setShowCreateReel(false)}
                />
            )}

            {/* Content Creation Picker */}
            {showCreatePicker && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreatePicker(false)}>
                    <div className="bg-[#16152a] border border-[#2A2850] rounded-2xl shadow-2xl p-6 w-72 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                        <h3 className="text-[#EAEAF0] font-semibold text-base text-center mb-2">What do you want to share?</h3>
                        <button
                            onClick={() => { setShowCreatePicker(false); setOpen(true); }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0A1A] hover:bg-[#1A1933] border border-[#2A2850] hover:border-[#FF9933]/50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#FF9933]/10 flex items-center justify-center group-hover:bg-[#FF9933]/20">
                                <svg className="w-5 h-5 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="text-[#EAEAF0] font-semibold text-sm">Post</p>
                                <p className="text-[#A1A1B5] text-xs">Share a photo</p>
                            </div>
                        </button>
                        <button
                            onClick={() => { setShowCreatePicker(false); setShowCreateReel(true); }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0A1A] hover:bg-[#1A1933] border border-[#2A2850] hover:border-[#C850C0]/50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#C850C0]/10 flex items-center justify-center group-hover:bg-[#C850C0]/20">
                                <svg className="w-5 h-5 text-[#C850C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="text-[#EAEAF0] font-semibold text-sm">Reel</p>
                                <p className="text-[#A1A1B5] text-xs">Share a short video</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeftSidebar