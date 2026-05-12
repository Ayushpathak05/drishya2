import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Send, MoreVertical, Music, X, Plus, Loader2, Bookmark, Share2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setReels, updateReelLike, addReelComment } from '@/redux/reelSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import CreateReel from './CreateReel';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

// ─── Comment Sheet ────────────────────────────────────────────────────────────
const CommentSheet = ({ reel, onClose, onAddComment }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `http://localhost:3000/api/v1/reel/${reel._id}/comment`,
                { text },
                { withCredentials: true }
            );
            if (res.data.success) {
                onAddComment(reel._id, res.data.comment);
                setText('');
                toast.success('Comment added!');
            }
        } catch (e) {
            toast.error('Failed to comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={onClose}>
            <div
                className="bg-[#16152a]/95 backdrop-blur-xl rounded-t-3xl max-h-[70%] flex flex-col border-t border-[#2A2850]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2850]">
                    <h3 className="text-[#EAEAF0] font-semibold text-base">Comments</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-[#A1A1B5] hover:text-[#EAEAF0]" /></button>
                </div>

                {/* Comment list */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 no-scrollbar">
                    {reel.comments?.length === 0 && (
                        <p className="text-[#A1A1B5] text-center py-8 text-sm">No comments yet. Be the first!</p>
                    )}
                    {reel.comments?.map((c, i) => (
                        <div key={c._id || i} className="flex items-start gap-3">
                            <Avatar className="w-7 h-7 shrink-0">
                                <AvatarImage src={c.author?.profilePicture} />
                                <AvatarFallback className="bg-[#2A2850] text-white text-xs">
                                    {c.author?.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[#FF9933] text-xs font-bold">{c.author?.username}</span>
                                <span className="text-[#EAEAF0] text-sm">{c.text}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#2A2850]">
                    <Avatar className="w-7 h-7 shrink-0">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="bg-[#2A2850] text-white text-xs">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent text-[#EAEAF0] placeholder:text-[#A1A1B5] text-sm outline-none"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="text-[#FF9933] font-bold text-sm disabled:opacity-40"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Single Reel Card ─────────────────────────────────────────────────────────
const ReelCard = ({ reel, isActive }) => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const [liked, setLiked] = useState(reel.likes?.includes(user?._id));
    const [showComment, setShowComment] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Play/pause when in view
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (isActive) {
            v.play().catch(() => {});
            setIsPlaying(true);
        } else {
            v.pause();
            v.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    // Progress bar update
    const handleTimeUpdate = () => {
        const v = videoRef.current;
        if (v && v.duration) {
            setProgress((v.currentTime / v.duration) * 100);
        }
    };

    // Seek on progress bar click
    const handleProgressClick = (e) => {
        const v = videoRef.current;
        if (!v) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        v.currentTime = ratio * v.duration;
    };

    const togglePlay = (e) => {
        // Don't toggle if clicking action buttons
        if (e.target.closest('[data-action]')) return;
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play(); setIsPlaying(true); }
        else { v.pause(); setIsPlaying(false); }
    };

    const handleDoubleTap = async () => {
        if (!liked) await likeHandler();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    const likeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:3000/api/v1/reel/${reel._id}/${action}`, { withCredentials: true });
            if (res.data.success) {
                dispatch(updateReelLike({ reelId: reel._id, userId: user._id, liked }));
                setLiked(!liked);
            }
        } catch (e) {
            toast.error('Action failed');
        }
    };

    const handleAddComment = (reelId, comment) => {
        dispatch(addReelComment({ reelId, comment }));
    };

    const shareHandler = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/reels`);
            toast.success('Reel link copied!');
        } catch {
            toast.info('Share: copy the URL from your browser!');
        }
    };

    const moodColor = {
        'Lit': 'text-orange-400', 'Funny': 'text-yellow-400', 'Aesthetic': 'text-pink-400',
        'Chill': 'text-blue-400', 'Inspiring': 'text-purple-400', 'Savage': 'text-red-400'
    };

    return (
        <div className="snap-start w-full md:w-[420px] h-full relative flex-shrink-0 overflow-hidden bg-black"
            onClick={togglePlay}
            onDoubleClick={handleDoubleTap}
        >
            {/* Video */}
            <video
                ref={videoRef}
                src={reel.video}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Double-tap heart burst */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <FaHeart size={120} className="text-red-500 drop-shadow-2xl animate-[heartBeat_0.8s_ease-in-out]" />
                </div>
            )}

            {/* Pause indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-8 h-8 text-white fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer z-20"
                onClick={e => { e.stopPropagation(); handleProgressClick(e); }}
                data-action="true"
            >
                <div
                    className="h-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] transition-none"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Right-side actions */}
            <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-10" data-action="true">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-2">
                    <Avatar className="w-11 h-11 ring-2 ring-[#FF9933] ring-offset-1 ring-offset-black">
                        <AvatarImage src={reel.author?.profilePicture} />
                        <AvatarFallback className="bg-[#2A2850] text-white text-sm font-bold">
                            {reel.author?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="w-5 h-5 rounded-full bg-[#FF9933] flex items-center justify-center -mt-2.5 border-2 border-black">
                        <Plus className="w-3 h-3 text-white" />
                    </div>
                </div>

                {/* Like */}
                <button data-action="true" onClick={e => { e.stopPropagation(); likeHandler(); }} className="flex flex-col items-center gap-1 group">
                    {liked
                        ? <FaHeart size={28} className="text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)] group-hover:scale-125 transition-transform" />
                        : <FaRegHeart size={28} className="text-white group-hover:text-red-400 group-hover:scale-125 transition-all" />
                    }
                    <span className="text-white text-xs font-semibold drop-shadow-md">{reel.likes?.length ?? 0}</span>
                </button>

                {/* Comment */}
                <button data-action="true" onClick={e => { e.stopPropagation(); setShowComment(true); }} className="flex flex-col items-center gap-1 group">
                    <MessageCircle className="w-7 h-7 text-white group-hover:text-[#FF9933] group-hover:scale-125 transition-all drop-shadow-md" />
                    <span className="text-white text-xs font-semibold drop-shadow-md">{reel.comments?.length ?? 0}</span>
                </button>

                {/* Share */}
                <button data-action="true" onClick={e => { e.stopPropagation(); shareHandler(); }} className="flex flex-col items-center gap-1 group">
                    <Share2 className="w-6 h-6 text-white group-hover:text-[#C850C0] group-hover:scale-125 transition-all drop-shadow-md" />
                </button>

                {/* More */}
                <button data-action="true" className="group">
                    <MoreVertical className="w-6 h-6 text-white group-hover:text-[#A1A1B5] transition-colors" />
                </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-3 z-10 w-[65%]" data-action="true">
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white text-sm drop-shadow-md">@{reel.author?.username}</span>
                    {reel.mood && (
                        <span className={`text-xs font-bold ${moodColor[reel.mood] || 'text-white'}`}>
                            {reel.mood === 'Lit' ? '🔥' : reel.mood === 'Funny' ? '😂' : reel.mood === 'Aesthetic' ? '🌸' : reel.mood === 'Chill' ? '😌' : reel.mood === 'Inspiring' ? '💡' : reel.mood === 'Savage' ? '💀' : ''} {reel.mood}
                        </span>
                    )}
                </div>
                {reel.caption && (
                    <p className="text-white/90 text-sm mb-2 leading-snug line-clamp-2">{reel.caption}</p>
                )}
                <div className="flex items-center gap-2 text-white/80 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <Music className="w-3.5 h-3.5 animate-spin-slow" />
                    <span className="text-xs">{reel.musicTitle || 'Original Audio'}</span>
                </div>
            </div>

            {/* Comment Sheet */}
            {showComment && (
                <CommentSheet
                    reel={reel}
                    onClose={() => setShowComment(false)}
                    onAddComment={handleAddComment}
                />
            )}
        </div>
    );
};

// ─── Main ReelsPage ──────────────────────────────────────────────────────────
const ReelsPage = () => {
    const dispatch = useDispatch();
    const { reels } = useSelector(store => store.reel);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const containerRef = useRef(null);
    const langPref = localStorage.getItem('preferred_language') || 'all';

    const fetchReels = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:3000/api/v1/reel/all?lang=${langPref}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                dispatch(setReels(res.data.reels));
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load reels');
        } finally {
            setLoading(false);
        }
    }, [langPref, dispatch]);

    useEffect(() => { fetchReels(); }, [fetchReels]);

    // Intersection Observer to detect active reel
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const children = Array.from(container.children);
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = children.indexOf(entry.target);
                        if (idx !== -1) setActiveIndex(idx);
                    }
                });
            },
            { root: container, threshold: 0.6 }
        );
        children.forEach(child => observer.observe(child));
        return () => observer.disconnect();
    }, [reels]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-112px)] md:h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#FF9933] border-t-transparent animate-spin" />
                <p className="text-[#A1A1B5] text-sm">Loading reels...</p>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-112px)] md:h-screen w-full bg-black">
            {/* Create Reel FAB */}
            <button
                onClick={() => setShowCreate(true)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9933] to-[#C850C0] flex items-center justify-center shadow-[0_4px_20px_rgba(255,153,51,0.5)] hover:scale-110 transition-transform"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>

            {/* Reels feed */}
            <div
                ref={containerRef}
                className="h-full w-full snap-y snap-mandatory overflow-y-scroll overflow-x-hidden flex flex-col items-center no-scrollbar"
            >
                {reels.length === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-4 px-6">
                        <div className="w-20 h-20 rounded-full bg-[#1A1933] flex items-center justify-center">
                            <Music className="w-10 h-10 text-[#A1A1B5]" />
                        </div>
                        <h3 className="text-white text-xl font-bold">No Reels Yet</h3>
                        <p className="text-[#A1A1B5] text-sm max-w-xs">Be the first to create a reel! Hit the + button above.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white font-semibold text-sm"
                        >
                            Create a Reel
                        </button>
                    </div>
                ) : (
                    reels.map((reel, index) => (
                        <ReelCard
                            key={reel._id}
                            reel={reel}
                            isActive={index === activeIndex}
                        />
                    ))
                )}
            </div>

            {/* Create Reel Modal */}
            {showCreate && (
                <CreateReel
                    onClose={() => setShowCreate(false)}
                    onReelCreated={() => { fetchReels(); setShowCreate(false); }}
                />
            )}
        </div>
    );
};

export default ReelsPage;
