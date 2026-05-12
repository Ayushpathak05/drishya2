import React from 'react'
import Posts from './Posts'

const Feed = ({ posts }) => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center'>
        <Posts posts={posts}/>
    </div>
  )
}

export default Feed