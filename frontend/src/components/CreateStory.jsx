import React, { useState, useRef } from 'react'
import { X, Image, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import ImageCropper from './ImageCropper'
import { API_BASE_URL } from '@/lib/api';

const CreateStory = ({ onClose, onStoryCreated }) => {
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [caption, setCaption] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCropper, setShowCropper] = useState(false)
    const [rawImageSrc, setRawImageSrc] = useState('')
    const fileInputRef = useRef(null)
    const { user } = useSelector(store => store.auth)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setRawImageSrc(e.target.result)
                    setShowCropper(true)
                }
                reader.readAsDataURL(file)
            } else {
                toast.error('Please select an image file')
            }
        }
    }

    const handleCropComplete = (croppedFile) => {
        setSelectedFile(croppedFile)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(croppedFile)
        setShowCropper(false)
    }

    const handleCropCancel = () => {
        setShowCropper(false)
        setRawImageSrc('')
        fileInputRef.current.value = ''
    }

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error('Please select an image')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', selectedFile)
            if (caption.trim()) {
                formData.append('caption', caption.trim())
            }

            const res = await axios.post('${API_BASE_URL}/api/v1/story/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })

            if (res.data.success) {
                toast.success('Story created successfully!')
                onStoryCreated && onStoryCreated()
                onClose()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Failed to create story')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setSelectedFile(null)
        setPreview(null)
        setCaption('')
        onClose()
    }

    return (
        <>
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                <div className='bg-[#16152a] text-[#EAEAF0] border border-[#2A2850] shadow-depth rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-4 border-b'>
                        <h3 className='text-lg font-semibold'>Create Story</h3>
                        <button
                            onClick={handleClose}
                            className='p-1 hover:bg-[#2A2850] rounded-full transition-colors'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>

                    {/* Content */}
                    <div className='p-4'>
                        {!preview ? (
                            // File selection
                            <div className='space-y-4'>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='w-12 h-12'>
                                        <AvatarImage src={user?.profilePicture} />
                                        <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className='font-semibold text-[#EAEAF0]'>{user?.username}</p>
                                        <p className='text-sm text-[#A1A1B5]'>Share a photo</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className='border-2 border-dashed border-[#2A2850] bg-[#0B0A1A] rounded-lg p-8 text-center cursor-pointer hover:border-[#FF9933] transition-colors'
                                >
                                    <div className='flex flex-col items-center gap-4'>
                                        <div className='w-16 h-16 bg-[#16152a] rounded-full flex items-center justify-center'>
                                            <Image className='w-8 h-8 text-[#A1A1B5]' />
                                        </div>
                                        <div>
                                            <p className='text-lg font-medium'>Select photo to share</p>
                                            <p className='text-sm text-[#A1A1B5]'>or drag and drop</p>
                                        </div>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='image/*'
                                    onChange={handleFileSelect}
                                    className='hidden'
                                />
                            </div>
                        ) : (
                            // Preview and caption
                            <div className='space-y-4'>
                                <div className='relative'>
                                    <img
                                        src={preview}
                                        alt='Story preview'
                                        className='w-full h-64 object-cover rounded-lg'
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreview(null)
                                        }}
                                        className='absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>

                                <Textarea
                                    placeholder='Write a caption...'
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className='resize-none bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] focus-visible:ring-1 focus-visible:ring-[#FF9933] placeholder:text-[#A1A1B5]'
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='flex items-center justify-end gap-3 p-4 border-t border-t-[#2A2850] bg-[#16152a]'>
                        <Button
                            variant='outline'
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedFile || loading}
                            className='bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(255,153,51,0.3)]'
                        >
                            {loading ? 'Creating...' : 'Share Story'}
                        </Button>
                    </div>
                </div>
            </div>

            {showCropper && (
                <ImageCropper
                    imageSrc={rawImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspect={9/16} // Vertical aspect ratio for stories
                />
            )}
        </>
    )
}

export default CreateStory
