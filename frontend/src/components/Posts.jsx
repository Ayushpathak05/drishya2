import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const {posts} = useSelector(store=>store.post);
  return (
    <div className='max-w-2xl mx-auto space-y-6'>
        {
            posts
              ?.filter((post) => post && post._id && post.author && post.author._id)
              ?.map((post, index) => (
                <Post key={post._id} post={post} />
              )) || null
        }
    </div>
  )
}

export default Posts