import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error('Please enter a search term')
            return
        }

        setLoading(true)
        try {
            const res = await axios.get(`http://localhost:3000/api/v1/user/search?query=${encodeURIComponent(searchTerm)}`, {
                withCredentials: true
            })

            if (res.data.success) {
                setSearchResults(res.data.users)
            } else {
                toast.error(res.data.message)
                setSearchResults([])
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to search users')
            setSearchResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`)
    }

    return (
        <div className='flex-1 my-8 flex flex-col items-center'>
            <div className='w-full max-w-md'>
                <div className='flex gap-2 mb-6'>
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='flex-1'
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        <Search className='w-4 h-4' />
                        {loading && <span className='ml-2'>...</span>}
                    </Button>
                </div>

                <div className='space-y-4'>
                    {searchResults.map((result) => (
                        <div
                            key={result._id}
                            onClick={() => handleUserClick(result._id)}
                            className='flex items-center gap-3 p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors'
                        >
                            <Avatar>
                                <AvatarImage src={result.profilePicture} />
                                <AvatarFallback>{result.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='font-semibold'>{result.username}</p>
                                <p className='text-sm text-gray-600'>{result.bio || 'No bio available'}</p>
                            </div>
                        </div>
                    ))}
                    {searchTerm && !loading && searchResults.length === 0 && (
                        <p className='text-center text-gray-500'>No users found</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchPage
