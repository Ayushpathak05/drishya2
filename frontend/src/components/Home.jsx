import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import Stories from './Stories'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import { useSelector, useDispatch } from 'react-redux'
import { setPosts } from '@/redux/postSlice'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    const { posts } = useSelector(store => store.post);
    const { appMode } = useSelector(store => store.auth);
    const isGrowthMode = appMode === 'growth';

    // Growth mode: only show Inspiring / Chill mood posts
    const filteredPosts = isGrowthMode
        ? posts.filter(p => ['Inspiring', 'Chill'].includes(p.mood))
        : posts;

    return (
        <div className='flex justify-center bg-neutral overflow-x-hidden w-full'>
            <div className='flex-grow w-full max-w-[700px] mx-auto px-4'>

                {/* Feed Mode Title Context */}
                {isGrowthMode ? (
                    <div className="flex items-center gap-2 pt-4 pb-2 mb-2 border-b border-[#2A2850]/50 text-green-400 font-bold text-sm">
                        📈 Growth Feed
                    </div>
                ) : (
                    <div className="flex items-center gap-2 pt-4 pb-2 mb-2 border-b border-[#2A2850]/50 text-[#FF9933] font-bold text-sm">
                        🎉 For You
                    </div>
                )}

                {isGrowthMode && filteredPosts.length === 0 && (
                    <div className="text-center py-8 text-[#A1A1B5] text-sm">
                        <p>📈 No Growth posts yet!</p>
                        <p className="text-xs mt-1">Post with mood <span className="text-green-400 font-semibold">Inspiring</span> or <span className="text-blue-400 font-semibold">Chill</span> to appear here.</p>
                    </div>
                )}

                <Stories />
                <Feed posts={filteredPosts} />
                <Outlet />
            </div>
        </div>
    )
}

export default Home
