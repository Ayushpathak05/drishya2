import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'
import { API_BASE_URL } from '@/lib/api';

const Post = ({ post }) => {
    if (!post || !post._id) {
        return null;
    }
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post?.likes?.includes(user?._id ?? '') || false);
    const [postLike, setPostLike] = useState(post?.likes?.length ?? 0);
    const [comment, setComment] = useState(post.comments || []);
    const [isBookmarked, setIsBookmarked] = useState(user?.bookmarks?.includes(post?._id) || false);
    const [showHeart, setShowHeart] = useState(false);
    const [isFollowing, setIsFollowing] = useState(user?.following?.includes(post?.author?._id));
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`${API_BASE_URL}/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p?._id === post?._id ? {
                        ...p,
                        likes: liked ? (p.likes?.filter(id => id !== user._id) ?? []) : [...(p.likes ?? []), user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const followToggleHandler = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/user/followorunfollow/${post?.author?._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                setIsFollowing(!isFollowing);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDoubleTapLike = async () => {

        if (!liked) {
            await likeOrDislikeHandler();
        }
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p?._id === post?._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`${API_BASE_URL}/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            // Optimistic update
            setIsBookmarked(!isBookmarked);
            const res = await axios.get(`${API_BASE_URL}/api/v1/post/${post?._id}/bookmark`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            } else {
                setIsBookmarked(!isBookmarked); // Revert on logic failure
            }
        } catch (error) {
            setIsBookmarked(!isBookmarked); // Revert on error
            console.log(error);
        }
    }
    return (
        <div className='my-8 w-full max-w-2xl mx-auto bg-[#1A1933] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-[2px] p-6 border border-border relative z-10'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <Avatar className='w-10 h-10 p-[2px] bg-gradient-primary shadow-glow transition-all hover:scale-105'>
                        <AvatarImage className="rounded-full border-[2px] border-card-dark" src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback className='bg-card-dark text-white rounded-full'>U</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-bold text-primary tracking-wide text-[15px]'>{post.author?.username}</h1>
                       {user?._id === post.author?._id &&  <Badge variant="secondary" className='bg-premium/10 text-premium border border-premium/20'>Author</Badge>}
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer text-secondary hover:text-primary hover:scale-[1.03] transition-all' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-[#1A192D] border border-border backdrop-blur-xl bg-opacity-70">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' onClick={() => { followToggleHandler(); setDialogOpen(false); }} className="cursor-pointer w-fit text-primary font-bold hover:text-indigo hover:bg-white/5 transition-all">{isFollowing ? 'Unfollow' : 'Follow'}</Button>
                        }
                        
                        <Button variant='ghost' onClick={() => setDialogOpen(false)} className="cursor-pointer w-fit text-primary hover:text-white transition-all">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={() => { deletePostHandler(); setDialogOpen(false); }} variant='ghost' className="cursor-pointer w-fit text-sindoor hover:bg-white/5 transition-colors">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="relative group overflow-hidden rounded-[14px] shadow-depth border border-border" onDoubleClick={handleDoubleTapLike}>
                <img
                    className='w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-[1.03]'
                    src={post.image}
                    alt="post_img"
                />
                {showHeart && (
                    <FaHeart size="100" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sindoor drop-shadow-2xl animate-heart-beat pointer-events-none" />
                )}
            </div>

            <div className='flex items-center justify-between my-4 pt-2'>
                <div className='flex items-center gap-4'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'26'} className='cursor-pointer text-sindoor hover:brightness-110 hover:scale-110 transition-all hover:-translate-y-1 drop-shadow-[0_0_15px_rgba(255,87,87,0.4)]' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'26'} className='cursor-pointer text-secondary hover:text-sindoor hover:scale-110 transition-all hover:-translate-y-1' />
                    }

                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer w-7 h-7 text-secondary hover:text-primary hover:scale-[1.05] transition-all hover:-translate-y-[2px]' />
                    <Send className='cursor-pointer w-6 h-6 text-secondary hover:text-primary hover:scale-[1.05] transition-all hover:-translate-y-[2px]' />
                </div>
                {
                    isBookmarked 
                        ? <Bookmark onClick={bookmarkHandler} className='cursor-pointer w-6 h-6 text-white fill-[#C850C0] stroke-[#C850C0] hover:brightness-110 hover:scale-[1.10] transition-all hover:-translate-y-[2px] drop-shadow-[0_0_10px_rgba(200,80,192,0.6)]' />
                        : <Bookmark onClick={bookmarkHandler} className='cursor-pointer w-6 h-6 text-secondary/70 hover:text-primary hover:scale-[1.05] transition-all hover:-translate-y-[2px]' />
                }
            </div>
            <span className='font-semibold block mb-2 text-primary'>
                {postLike} likes
            </span>
            {post.mood && (
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-2 border ${
                    post.mood === 'Lit' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                    post.mood === 'Funny' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                    post.mood === 'Aesthetic' ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' :
                    post.mood === 'Chill' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                    post.mood === 'Inspiring' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                    post.mood === 'Savage' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-gray-500/10 border-gray-500/30 text-gray-400'
                }`}>
                    {post.mood === 'Lit' ? '🔥' : post.mood === 'Funny' ? '😂' : post.mood === 'Aesthetic' ? '🌸' : post.mood === 'Chill' ? '😌' : post.mood === 'Inspiring' ? '💡' : post.mood === 'Savage' ? '💀' : ''} {post.mood}
                </span>
            )}
            <p className='mb-2 text-sm leading-relaxed text-secondary'>
                <span className='font-bold mr-2 text-primary'>{post.author?.username}</span>
                <span>{post.caption}</span>
            </p>
            {
                comment?.length > 0 && (
                    <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-secondary hover:text-primary transition-colors mb-4 block'>
                        View all {comment.length} comments
                    </span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between border-t border-border pt-4 mt-2'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full bg-transparent text-primary placeholder:text-secondary selection:bg-indigo/30'
                />
                {
                    text && <span onClick={commentHandler} className='text-indigo cursor-pointer font-bold hover:text-indigo/80 hover:-translate-y-0.5 transition-all ml-2'>Post</span>
                }
            </div>
        </div>
    )
}

export default Post