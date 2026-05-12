import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Plus } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import StoryViewer from './StoryViewer'
import CreateStory from './CreateStory'

const Stories = () => {
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(null)
    const [showCreateStory, setShowCreateStory] = useState(false)
    const { user } = useSelector(store => store.auth)

    useEffect(() => {
        fetchStories()
    }, [])

    const fetchStories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/v1/story', {
                withCredentials: true
            })

            if (res.data.success) {
                setStories(res.data.stories)
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to fetch stories')
        } finally {
            setLoading(false)
        }
    }

    const handleStoryClick = (storyIndex) => {
        setSelectedStoryIndex(storyIndex)
    }

    const handleCloseViewer = () => {
        setSelectedStoryIndex(null)
    }

    const handleCreateStory = () => {
        setShowCreateStory(true)
    }

    const handleStoryCreated = () => {
        fetchStories() // Refresh stories after creating new one
    }

    // Group stories by author
    const groupedStories = stories.reduce((acc, story) => {
        const authorId = story.author._id
        if (!acc[authorId]) {
            acc[authorId] = {
                author: story.author,
                stories: []
            }
        }
        acc[authorId].stories.push(story)
        return acc
    }, {})

    const storyGroups = Object.values(groupedStories)

    if (loading) {
        return (
            <div className='flex gap-4 p-4 overflow-x-auto'>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex-shrink-0'>
                        <div className='w-16 h-16 rounded-full bg-gray-200 animate-pulse'></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className='flex gap-4 p-4 overflow-x-auto scrollbar-hide'>
                {/* Create Story */}
                <div className='flex-shrink-0'>
                    <div
                        onClick={handleCreateStory}
                        className='relative cursor-pointer group hover:-translate-y-[2px] transition-all duration-300 hover:scale-105'
                    >
                        <Avatar className='w-16 h-16 border-[3px] border-[#2A2850] group-hover:border-accent transition-colors duration-300 group-hover:shadow-[0_0_15px_rgba(255,153,51,0.3)]'>
                            <AvatarImage src={user?.profilePicture} />
                            <AvatarFallback className="bg-card text-white">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-background shadow-depth group-hover:shadow-glow-saffron'>
                            <Plus className='w-3 h-3 text-white' />
                        </div>
                    </div>
                    <p className='text-xs text-center mt-1 text-secondary font-medium'>Your story</p>
                </div>

                {/* Other Stories */}
                {storyGroups.map((group, index) => (
                    <div key={group.author._id} className='flex-shrink-0 group'>
                        <div
                            onClick={() => handleStoryClick(index)}
                            className='relative cursor-pointer rounded-full p-[3px] bg-gradient-story shadow-sm group-hover:-translate-y-[2px] hover:scale-105 group-hover:shadow-[0_0_20px_rgba(123,47,255,0.4)] transition-all duration-300'
                        >
                            <Avatar className='w-16 h-16 border-[3px] border-background'>
                                <AvatarImage src={group.author.profilePicture} />
                                <AvatarFallback className="bg-card text-white">{group.author.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <p className='text-xs text-center mt-2 text-primary font-medium truncate w-16'>
                            {group.author.username}
                        </p>
                    </div>
                ))}
            </div>

            {/* Story Viewer */}
            {selectedStoryIndex !== null && (
                <StoryViewer
                    stories={storyGroups[selectedStoryIndex]?.stories || []}
                    initialIndex={0}
                    onClose={handleCloseViewer}
                />
            )}

            {/* Create Story Modal */}
            {showCreateStory && (
                <CreateStory
                    onClose={() => setShowCreateStory(false)}
                    onStoryCreated={handleStoryCreated}
                />
            )}
        </>
    )
}

export default Stories
