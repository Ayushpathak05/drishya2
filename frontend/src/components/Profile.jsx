import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Film, Play, Zap, Trophy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserProfile } from '@/redux/authSlice';

const LEVEL_NAMES = ['Rookie', 'Explorer', 'Builder', 'Hustler', 'Achiever', 'Elite', 'Master', 'Champion', 'Legend', 'GOAT'];
const LEVEL_ICONS = ['🌱', '🚀', '🔨', '💪', '🏅', '⚡', '🎯', '🏆', '💎', '👑'];
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];

const XPBar = ({ xp = 0, level = 1, isOwn }) => {
    const current = LEVEL_THRESHOLDS[level - 1] || 0;
    const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
    const navigate = useNavigate();

    return (
        <div
            onClick={() => isOwn && navigate('/challenges')}
            className={`bg-[#1A1933] border border-[#2A2850] rounded-2xl px-4 py-3 mt-3 ${isOwn ? 'cursor-pointer hover:border-[#FF9933]/40 transition-all group' : ''}`}
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{LEVEL_ICONS[level - 1] || '👑'}</span>
                    <span className="text-[#EAEAF0] font-semibold text-sm">Lv.{level} {LEVEL_NAMES[level - 1] || 'GOAT'}</span>
                </div>
                <div className="flex items-center gap-1 text-[#FF9933] text-sm font-bold">
                    <Zap className="w-3.5 h-3.5" />{xp} XP
                </div>
            </div>
            <div className="w-full h-2 bg-[#2A2850] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            {isOwn && <p className="text-[#6B6B85] text-[10px] mt-1 group-hover:text-[#A1A1B5] transition-colors">Tap to earn more XP →</p>}
        </div>
    );
};

const Profile = () => {
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);
    const [activeTab, setActiveTab] = useState('posts');
    const [userReels, setUserReels] = useState([]);
    const [reelsLoading, setReelsLoading] = useState(false);

    const { userProfile, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const isLoggedInUserProfile = user?._id === userProfile?._id;
    const isFollowing = user?.following?.includes(userProfile?._id);

    useEffect(() => {
        if (activeTab === 'reels' && userId) {
            setReelsLoading(true);
            axios.get(`http://localhost:3000/api/v1/reel/user/${userId}`, { withCredentials: true })
                .then(res => { if (res.data.success) setUserReels(res.data.reels); })
                .catch(err => console.error(err))
                .finally(() => setReelsLoading(false));
        }
    }, [activeTab, userId]);

    const followHandler = async () => {
        try {
            const res = await axios.post(`http://localhost:3000/api/v1/user/followorunfollow/${userId}`, {}, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setUserProfile(res.data.user));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const displayedPost = activeTab === 'posts' ? userProfile?.posts : activeTab === 'saved' ? userProfile?.bookmarks : null;
    const profileXP = (isLoggedInUserProfile ? user?.xp : userProfile?.xp) ?? 0;
    const profileLevel = (isLoggedInUserProfile ? user?.level : userProfile?.level) ?? 1;
    const profileBadges = (isLoggedInUserProfile ? user?.badges : userProfile?.badges) ?? [];

    return (
        <div className="flex max-w-5xl justify-center mx-auto pl-10">
            <div className="flex flex-col gap-12 p-8 w-full">
                {/* Profile Header */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Avatar */}
                    <section className="flex items-center justify-center">
                        <div className="relative">
                            <Avatar className="h-32 w-32 ring-2 ring-[#FF9933]/50 p-[2px] bg-gradient-to-r from-[#FF9933] to-[#C850C0]">
                                <AvatarImage className="rounded-full" src={userProfile?.profilePicture} alt="profile" />
                                <AvatarFallback className="bg-[#16152a] text-white w-full h-full flex items-center justify-center text-4xl font-bold rounded-full">
                                    {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {/* Level badge */}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FF9933] flex items-center justify-center text-sm border-2 border-[#0B0A1A]">
                                {LEVEL_ICONS[(profileLevel - 1)] || '👑'}
                            </div>
                        </div>
                    </section>

                    {/* Info */}
                    <section>
                        <div className="flex flex-col gap-4">
                            {/* Username row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[#EAEAF0] font-semibold text-lg">{userProfile?.username}</span>
                                {userProfile?.openToWork && (
                                    <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                        ✅ Open to Work
                                    </span>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {isLoggedInUserProfile ? (
                                    <>
                                        <Link to="/account/edit">
                                            <Button variant="secondary" className="hover:bg-[#2A2850] bg-[#16152a] text-[#EAEAF0] h-8 border border-[#2A2850] text-xs">Edit Profile</Button>
                                        </Link>
                                        <Link to="/leaderboard">
                                            <Button variant="secondary" className="hover:bg-[#2A2850] bg-[#16152a] text-[#FF9933] h-8 border border-[#FF9933]/30 text-xs flex items-center gap-1">
                                                <Trophy className="w-3.5 h-3.5" />Leaderboard
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {isFollowing ? (
                                            <Button onClick={followHandler} variant="secondary" className="hover:bg-[#2A2850] bg-[#16152a] text-[#EAEAF0] h-8 border border-[#2A2850] text-xs">Unfollow</Button>
                                        ) : (
                                            <Button onClick={followHandler} className="bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white h-8 text-xs hover:brightness-110">Follow</Button>
                                        )}
                                        <Button variant="secondary" className="hover:bg-[#2A2850] bg-[#16152a] text-[#EAEAF0] h-8 border border-[#2A2850] text-xs">Message</Button>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6">
                                <p className="text-[#EAEAF0]"><span className="font-bold">{userProfile?.posts?.length ?? 0} </span><span className="text-[#A1A1B5] text-sm">posts</span></p>
                                <p className="text-[#EAEAF0]"><span className="font-bold">{userProfile?.followers?.length ?? 0} </span><span className="text-[#A1A1B5] text-sm">followers</span></p>
                                <p className="text-[#EAEAF0]"><span className="font-bold">{userProfile?.following?.length ?? 0} </span><span className="text-[#A1A1B5] text-sm">following</span></p>
                            </div>

                            {/* Bio + College */}
                            <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-[#EAEAF0] text-sm">{userProfile?.bio || 'Bio here...'}</span>
                                {userProfile?.college && (
                                    <span className="text-[#A1A1B5] text-xs flex items-center gap-1">🎓 {userProfile.college}{userProfile?.yearOfStudy ? ` · ${userProfile.yearOfStudy}` : ''}</span>
                                )}
                                <Badge className="w-fit bg-[#16152a] text-[#A1A1B5] border border-[#2A2850] text-xs" variant="secondary">
                                    <AtSign className="w-3.5 h-3.5" /><span className="pl-1">{userProfile?.username}</span>
                                </Badge>
                            </div>

                            {/* Skills */}
                            {userProfile?.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {userProfile.skills.slice(0, 6).map(s => (
                                        <span key={s} className="text-[10px] bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] px-2 py-0.5 rounded-full font-semibold">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* XP Bar */}
                <div className="-mt-8">
                    <XPBar xp={profileXP} level={profileLevel} isOwn={isLoggedInUserProfile} />

                    {/* Badges */}
                    {profileBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {profileBadges.map((badge, i) => (
                                <span key={i} className="text-xs bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] px-2.5 py-1 rounded-full font-semibold">{badge}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-t border-[#2A2850] -mt-6">
                    <div className="flex items-center justify-center gap-10 text-sm text-[#A1A1B5]">
                        {[
                            { id: 'posts', label: 'POSTS' },
                            { id: 'saved', label: 'SAVED' },
                            { id: 'reels', label: 'REELS' },
                            { id: 'tags', label: 'TAGS' },
                        ].map(tab => (
                            <span
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 cursor-pointer transition-all duration-200 hover:text-[#EAEAF0] flex items-center gap-1.5 ${activeTab === tab.id ? 'font-bold text-[#EAEAF0] border-t-2 border-[#FF9933] -mt-[2px]' : ''}`}
                            >
                                {tab.id === 'reels' && <Film className="w-3.5 h-3.5" />}
                                {tab.label}
                            </span>
                        ))}
                    </div>

                    {/* Posts / Saved Grid */}
                    {(activeTab === 'posts' || activeTab === 'saved') && (
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            {(!displayedPost || displayedPost.length === 0) && (
                                <div className="col-span-3 py-16 text-center text-[#A1A1B5] text-sm">
                                    {activeTab === 'posts' ? 'No posts yet.' : 'No saved posts yet.'}
                                </div>
                            )}
                            {displayedPost?.map(post => (
                                <div key={post?._id} className="relative group cursor-pointer">
                                    <img src={post.image} alt="post" className="rounded-sm my-1 w-full aspect-square object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm">
                                        <div className="flex items-center text-white space-x-4">
                                            <span className="flex items-center gap-1.5 text-sm font-semibold"><Heart className="w-4 h-4 fill-white" />{post?.likes?.length}</span>
                                            <span className="flex items-center gap-1.5 text-sm font-semibold"><MessageCircle className="w-4 h-4 fill-white" />{post?.comments?.length}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reels Grid */}
                    {activeTab === 'reels' && (
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            {reelsLoading ? (
                                <div className="col-span-3 py-16 flex justify-center">
                                    <div className="w-8 h-8 rounded-full border-4 border-[#FF9933] border-t-transparent animate-spin" />
                                </div>
                            ) : userReels.length === 0 ? (
                                <div className="col-span-3 py-16 text-center text-[#A1A1B5] text-sm">
                                    <Film className="w-10 h-10 mx-auto mb-3 text-[#2A2850]" />
                                    No reels yet.
                                </div>
                            ) : (
                                userReels.map(reel => (
                                    <div key={reel._id} className="relative group cursor-pointer aspect-[9/16] overflow-hidden rounded-sm my-1">
                                        <video src={reel.video} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play className="w-8 h-8 text-white fill-white" />
                                        </div>
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold">
                                            <Heart className="w-3.5 h-3.5 fill-white" />{reel.likes?.length}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'tags' && (
                        <div className="py-16 text-center text-[#A1A1B5] text-sm">
                            <AtSign className="w-10 h-10 mx-auto mb-3 text-[#2A2850]" />
                            No tagged posts yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;