import React, { useState } from 'react';
import { Home, Search, PlaySquare, PlusSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import CreatePost from './CreatePost';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const [openCreate, setOpenCreate] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: Home, path: '/', name: 'Home' },
        { icon: Search, path: '/search', name: 'Search' },
        { icon: PlaySquare, path: '/reels', name: 'Reels' },
    ];

    return (
        <>
            <div className='md:hidden fixed bottom-0 w-full z-50 bg-[#16152a]/70 backdrop-blur-[12px] border-t border-[#2A2850] shadow-depth flex justify-around items-center px-2 h-14 pb-env-safe transition-colors duration-300'>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div 
                            key={item.name} 
                            onClick={() => navigate(item.path)}
                            className={`p-2 cursor-pointer transition-all duration-300 ${isActive(item.path) ? 'scale-110 text-accent -translate-y-2' : 'text-secondary hover:text-primary hover:-translate-y-2'}`}
                        >
                            <Icon className={`w-7 h-7 ${isActive(item.path) ? 'fill-accent' : ''}`} />
                        </div>
                    );
                })}
                
                {/* Create Action */}
                <div 
                    onClick={() => setOpenCreate(true)}
                    className="p-2 cursor-pointer text-secondary hover:text-indigo transition-all hover:scale-110 hover:-translate-y-2"
                >
                    <PlusSquare className="w-7 h-7" />
                </div>

                {/* Profile */}
                <div 
                    onClick={() => navigate(`/profile/${user?._id}`)}
                    className={`p-[2px] cursor-pointer rounded-full transition-all duration-300 ${isActive(`/profile/${user?._id}`) ? 'bg-gradient-primary scale-110 -translate-y-2 shadow-glow' : 'bg-transparent hover:bg-gradient-primary hover:scale-110 hover:-translate-y-2'}`}
                >
                    <Avatar className='w-7 h-7 border-[2px] border-[#16152a]'>
                        <AvatarImage className="rounded-full" src={user?.profilePicture} />
                        <AvatarFallback className="bg-card shadow-inner text-[10px] text-white">U</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <CreatePost open={openCreate} setOpen={setOpenCreate} />
        </>
    );
};

export default BottomNavigation;
