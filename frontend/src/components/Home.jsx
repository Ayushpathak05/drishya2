import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import Stories from './Stories'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'
import { useSelector, useDispatch } from 'react-redux'
import { setPosts } from '@/redux/postSlice'

// Campus-relevant hashtags — posts with these tags only appear in Campus section
const CAMPUS_TAGS = [
    '#study','#campus','#college','#university','#exam','#exams',
    '#notes','#lecture','#lectures','#internship','#career','#job',
    '#jobs','#hackathon','#collaborate','#collab','#teammate',
    '#placement','#project','#research','#assignment','#homework',
    '#semester','#syllabus','#cgpa','#coding','#competitive','#dsa',
    '#opentowork','#opportunity','#workshop','#fest','#techfest',
];
const isCampusPost = (caption = '') => {
    const lower = caption.toLowerCase();
    return CAMPUS_TAGS.some(tag => lower.includes(tag));
};

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    const { posts } = useSelector(store => store.post);
    const { appMode } = useSelector(store => store.auth);
    const isGrowthMode = appMode === 'growth';

    // Auto-filter by caption:
    // For You  → posts WITHOUT campus/study tags (normal content)
    // Growth   → posts WITH campus/study tags (study/career content)
    const filteredPosts = isGrowthMode
        ? posts.filter(p => isCampusPost(p.caption))
        : posts.filter(p => !isCampusPost(p.caption));

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

                {filteredPosts.length === 0 && (
                    <div className="text-center py-8 text-[#A1A1B5] text-sm">
                        {isGrowthMode ? (
                            <>
                                <p>📈 No campus posts yet!</p>
                                <p className="text-xs mt-1">Post with tags like <span className="text-[#FF9933] font-semibold">#study</span>, <span className="text-[#FF9933] font-semibold">#campus</span>, <span className="text-[#FF9933] font-semibold">#exam</span> to appear here.</p>
                            </>
                        ) : (
                            <>
                                <p>🎉 No posts yet!</p>
                                <p className="text-xs mt-1">Posts without campus tags will appear here.</p>
                            </>
                        )}
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
