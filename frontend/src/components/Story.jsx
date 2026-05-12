import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Heart, MessageCircle, X, Eye } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api';

const Story = ({ story, onClose, onNext, onPrev, isFirst, isLast }) => {
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [viewsCount, setViewsCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const { user } = useSelector(store => store.auth)

    useEffect(() => {
        if (story) {
            setIsLiked(story.likes?.includes(user?._id) || false)
            setLikesCount(story.likes?.length || 0)
            setViewsCount(story.views?.length || 0)
            // Mark as viewed
            markAsViewed()
        }
    }, [story, user])

    const markAsViewed = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/story/${story._id}/view`, {}, {
                withCredentials: true
            })
        } catch (error) {
            console.log('Error marking story as viewed:', error)
        }
    }

    const handleLike = async () => {
        if (loading) return

        setLoading(true)
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/story/${story._id}/like`, {}, {
                withCredentials: true
            })

            if (res.data.success) {
                setIsLiked(!isLiked)
                setLikesCount(res.data.likes)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to like story')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight' && !isLast) {
            onNext()
        } else if (e.key === 'ArrowLeft' && !isFirst) {
            onPrev()
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [isFirst, isLast])

    if (!story) return null

    return (
        <div className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50'>
            <div className='relative max-w-md w-full h-full max-h-screen bg-black rounded-lg overflow-hidden'>
                {/* Header */}
                <div className='absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='w-8 h-8 border-2 border-white'>
                                <AvatarImage src={story.author?.profilePicture} />
                                <AvatarFallback>{story.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='text-white font-semibold text-sm'>{story.author?.username}</p>
                                <p className='text-white/70 text-xs'>
                                    {new Date(story.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className='text-white hover:bg-white/20 rounded-full p-1'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>
                </div>

                {/* Story Image */}
                <img
                    src={story.image}
                    alt='Story'
                    className='w-full h-full object-cover'
                />

                {/* Caption */}
                {story.caption && (
                    <div className='absolute bottom-20 left-4 right-4 bg-black/50 rounded-lg p-3'>
                        <p className='text-white text-sm'>{story.caption}</p>
                    </div>
                )}

                {/* Actions */}
                <div className='absolute bottom-4 left-4 right-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={handleLike}
                            disabled={loading}
                            className={`p-2 rounded-full ${isLiked ? 'bg-red-500' : 'bg-white/20'} hover:bg-white/30 transition-colors`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
                        </button>
                        <div className='flex items-center gap-1 text-white text-sm'>
                            <Eye className='w-4 h-4' />
                            <span>{viewsCount}</span>
                        </div>
                        <div className='flex items-center gap-1 text-white text-sm'>
                            <Heart className='w-4 h-4' />
                            <span>{likesCount}</span>
                        </div>
                    </div>

                    {/* Navigation hints */}
                    <div className='text-white/50 text-xs'>
                        {!isFirst && '← Prev'} {!isLast && !isFirst && ' | '} {!isLast && 'Next →'}
                    </div>
                </div>

                {/* Click areas for navigation */}
                {!isFirst && (
                    <div
                        className='absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer'
                        onClick={onPrev}
                    />
                )}
                {!isLast && (
                    <div
                        className='absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer'
                        onClick={onNext}
                    />
                )}
            </div>
        </div>
    )
}

export default Story
