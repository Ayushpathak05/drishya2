import { useEffect } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import SearchPage from './components/SearchPage'
import ExplorePage from './components/ExplorePage'
import ReelsPage from './components/ReelsPage'
import CampusPage from './components/CampusPage'
import ChallengesPage from './components/ChallengesPage'
import LeaderboardPage from './components/LeaderboardPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import { setIncomingCall } from './redux/callSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import CallScreen from './components/CallScreen'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
      {
        path: '/search',
        element: <ProtectedRoutes><SearchPage /></ProtectedRoutes>
      },
      {
        path: '/explore',
        element: <ProtectedRoutes><ExplorePage /></ProtectedRoutes>
      },
      {
        path: '/reels',
        element: <ProtectedRoutes><ReelsPage /></ProtectedRoutes>
      },
      {
        path: '/campus',
        element: <ProtectedRoutes><CampusPage /></ProtectedRoutes>
      },
      {
        path: '/challenges',
        element: <ProtectedRoutes><ChallengesPage /></ProtectedRoutes>
      },
      {
        path: '/leaderboard',
        element: <ProtectedRoutes><LeaderboardPage /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

import { initSocket, closeSocket } from './socketConnection'

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = initSocket(user?._id);
      dispatch(setSocket(true)); // just saving placeholder flag to redux instead of full class

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socketio.on('callUser', (data) => {
        dispatch(setIncomingCall({ signal: data.signal, from: data.from, name: data.name }));
      });

      return () => {
        closeSocket();
        dispatch(setSocket(null));
      }
    } else {
      closeSocket();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
      <CallScreen />
    </>
  )
}

export default App
