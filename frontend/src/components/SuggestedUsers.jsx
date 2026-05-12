import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { setSuggestedUsers } from '@/redux/authSlice';
import { API_BASE_URL } from '@/lib/api';

const SuggestedUsers = () => {
    const { suggestedUsers, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const followHandler = async (userId) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/user/followorunfollow/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                // Update suggested users list after follow
                const updatedSuggestedUsers = suggestedUsers.filter(user => user._id !== userId);
                dispatch(setSuggestedUsers(updatedSuggestedUsers));
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    return (
        <div className='my-10'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='section-title'>Suggested for you</h1>
                <span className='font-medium cursor-pointer text-[#CFCFE6] hover:text-[#EAEAF0]'>See All</span>
            </div>
            {
                suggestedUsers
                .filter(suggestedUser => !user?.following?.includes(suggestedUser._id))
                .map((user) => {
                    return (
                        <div key={user._id} className='flex items-center justify-between my-5 p-3 rounded-[12px] hover:bg-[#1A1933] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,153,51,0.15)]'>
                            <div className='flex items-center gap-3'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar className='w-10 h-10 p-[2px] bg-gradient-primary'>
                                        <AvatarImage className="rounded-full border border-[#16152a]" src={user?.profilePicture} alt="post_image" />
                                        <AvatarFallback className='bg-[#16152a] text-white rounded-full'>U</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className='truncate max-w-[100px]'>
                                    <h1 className='font-bold text-sm text-[#EAEAF0] opacity-100 filter-none truncate'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                    <span className='text-[#A1A1B5] text-sm opacity-100 filter-none truncate block'>{user?.bio || 'Bio here...'}</span>
                                </div>
                            </div>
                            <span onClick={() => followHandler(user._id)} className='px-4 py-1.5 rounded-full bg-gradient-primary text-white text-xs font-bold cursor-pointer hover:shadow-[0_0_15px_rgba(123,47,255,0.4)] hover:brightness-110 hover:scale-105 transition-all duration-300 ml-2'>Follow</span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUsers