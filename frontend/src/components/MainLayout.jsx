import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import TopNavbar from './TopNavbar'
import BottomNavigation from './BottomNavigation'
import RightSidebar from './RightSidebar'

const MainLayout = () => {
  return (
    <div className='flex flex-col md:flex-row min-h-screen bg-background-dark font-outfit'>
         <TopNavbar />
         <div className='hidden md:flex flex-shrink-0'>
             <LeftSidebar/>
         </div>
        <div className='flex-1 w-full md:w-[calc(100%-20%)] md:ml-[20%] lg:w-[calc(100%-40%)] lg:mr-[20%] pt-14 pb-16 md:pt-0 md:pb-0 relative'>
            <Outlet/>
        </div>
        <RightSidebar />
        <BottomNavigation />
    </div>
  )
}

export default MainLayout