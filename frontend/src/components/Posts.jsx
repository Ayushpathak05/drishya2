import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = ({ posts: propPosts }) => {
  // Use prop posts if provided (filtered by Home.jsx), otherwise fall back to Redux store
  const { posts: storePosts } = useSelector(store => store.post);
  const posts = propPosts !== undefined ? propPosts : storePosts;

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