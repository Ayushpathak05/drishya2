import React, { useState, useEffect } from 'react'
import Story from './Story'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const StoryViewer = ({ stories, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleClose = () => {
        onClose()
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < stories.length - 1) {
                handleNext()
            } else {
                handleClose()
            }
        }, 5000) // Auto advance every 5 seconds

        return () => clearTimeout(timer)
    }, [currentIndex, stories.length])

    if (!stories || stories.length === 0) return null

    return (
        <Story
            story={stories[currentIndex]}
            onClose={handleClose}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={currentIndex === 0}
            isLast={currentIndex === stories.length - 1}
        />
    )
}

export default StoryViewer
