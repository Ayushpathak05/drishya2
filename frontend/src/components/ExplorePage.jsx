import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Post from './Post'

const ExplorePage = () => {
    const { posts } = useSelector(store => store.post)
    const [explorePosts, setExplorePosts] = useState([])

    useEffect(() => {
        // Mock explore functionality - in real app, this would fetch trending/explore posts
        // For now, just shuffle the existing posts
        const shuffled = [...posts].sort(() => Math.random() - 0.5)
        setExplorePosts(shuffled)
    }, [posts])

    return (
        <div className='flex-1 my-8 flex flex-col items-center'>
            <div className='w-full max-w-2xl'>
                <h1 className='text-2xl font-bold mb-6 text-center'>Explore</h1>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 auto-rows-[200px]'>
                    {explorePosts.map((post, index) => {
                        const isLarge = index % 5 === 0; // Every 5th post takes more space
                        return (
                            <div 
                                key={post._id} 
                                className={`relative overflow-hidden group cursor-pointer ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                            >
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="flex gap-4 text-white font-bold">
                                        <div className="flex items-center gap-1"><span className="text-xl">♥</span> {post.likes?.length || 0}</div>
                                        <div className="flex items-center gap-1"><span className="text-xl">💬</span> {post.comments?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {explorePosts.length === 0 && (
                    <p className='text-center text-gray-500 mt-8'>No posts to explore yet</p>
                )}
            </div>
        </div>
    )
}

export default ExplorePage
