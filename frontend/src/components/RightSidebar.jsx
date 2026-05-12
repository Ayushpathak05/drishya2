import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { setAppMode } from '@/redux/authSlice';
import SuggestedUsers from './SuggestedUsers';
import { Zap, Trophy, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

const LEVEL_NAMES = ['Rookie', 'Explorer', 'Builder', 'Hustler', 'Achiever', 'Elite', 'Master', 'Champion', 'Legend', 'GOAT'];
const LEVEL_ICONS = ['🌱', '🚀', '🔨', '💪', '🏅', '⚡', '🎯', '🏆', '💎', '👑'];
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];

const RightSidebar = () => {
    const { user, appMode } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [todayChallenge, setTodayChallenge] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/v1/challenge`, { withCredentials: true })
            .then(res => {
                if (res.data.success) {
                    const unfinished = res.data.challenges.find(c => !c.completed);
                    setTodayChallenge(unfinished || res.data.challenges[0]);
                }
            })
            .catch(() => {});
    }, []);

    const xp = user?.xp ?? 0;
    const level = user?.level ?? 1;
    const current = LEVEL_THRESHOLDS[level - 1] || 0;
    const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));

    return (
        <div className="hidden fixed top-0 right-0 z-10 w-[20%] h-screen lg:block pr-4 pl-4 bg-[#16152a]/60 backdrop-blur-[16px] p-6 shadow-sm border-l border-[#2A2850]/50 transition-all duration-300 overflow-y-auto no-scrollbar">

            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-1 bg-[#0B0A1A] p-1 rounded-xl mb-6 mt-2 border border-[#2A2850]">
                <button
                    onClick={() => { dispatch(setAppMode('for-you')); navigate('/'); }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                        appMode === 'for-you'
                            ? 'bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white shadow-md'
                            : 'text-[#A1A1B5] hover:text-[#EAEAF0]'
                    }`}
                >
                    🎉 For You
                </button>
                <button
                    onClick={() => { dispatch(setAppMode('growth')); navigate('/'); }}
                    className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                        appMode === 'growth'
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400 shadow-md'
                            : 'text-[#A1A1B5] hover:text-[#EAEAF0]'
                    }`}
                >
                    📈 Growth
                </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 mb-5 mt-6">
                <Link to={`/profile/${user?._id}`} className="hover:-translate-y-[2px] transition-transform duration-300 hover:scale-105 shrink-0">
                    <Avatar className="w-11 h-11 p-[2px] bg-gradient-to-r from-[#FF9933] to-[#C850C0] hover:shadow-[0_0_15px_rgba(255,153,51,0.3)] transition-all">
                        <AvatarImage className="rounded-full border border-[#2A2850]" src={user?.profilePicture} alt="profile" />
                        <AvatarFallback className="bg-[#0B0A1A] text-white rounded-full text-sm">U</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="min-w-0">
                    <h1 className="font-bold text-sm text-[#EAEAF0] truncate">
                        <Link to={`/profile/${user?._id}`} className="hover:text-[#FF9933] transition-colors">{user?.username}</Link>
                    </h1>
                    <span className="text-[#A1A1B5] text-xs truncate block">{user?.bio || 'Campus Mode 🎓'}</span>
                </div>
            </div>

            {/* XP Mini Card (Growth Mode Only) */}
            {appMode === 'growth' && (
                <div
                    onClick={() => navigate('/challenges')}
                    className="bg-[#1A1933] border border-[#2A2850] rounded-2xl p-3 mb-4 cursor-pointer hover:border-[#FF9933]/40 transition-all group"
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base">{LEVEL_ICONS[level - 1] || '👑'}</span>
                            <span className="text-[#EAEAF0] text-xs font-semibold">Lv.{level} {LEVEL_NAMES[level - 1]}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#FF9933] text-xs font-bold">
                            <Zap className="w-3 h-3" />{xp}
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2850] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[#6B6B85] text-[10px] mt-1 group-hover:text-[#A1A1B5] transition-colors">Earn XP → Complete challenges</p>
                </div>
            )}

            {/* Today's Challenge mini card (Growth Mode Only) */}
            {appMode === 'growth' && todayChallenge && !todayChallenge.completed && (
                <div
                    onClick={() => navigate('/challenges')}
                    className="bg-gradient-to-r from-[#FF9933]/10 to-[#C850C0]/10 border border-[#FF9933]/20 rounded-2xl p-3 mb-4 cursor-pointer hover:border-[#FF9933]/40 transition-all"
                >
                    <p className="text-[#FF9933] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Today's Challenge
                    </p>
                    <p className="text-[#EAEAF0] text-xs font-semibold flex items-center gap-1.5">
                        {todayChallenge.emoji} {todayChallenge.title}
                    </p>
                    <p className="text-[#A1A1B5] text-[10px] mt-0.5">+{todayChallenge.xpReward} XP</p>
                </div>
            )}

            {/* Campus shortcut (Growth Mode Only) */}
            {appMode === 'growth' && user?.college && (
                <div
                    onClick={() => navigate('/campus')}
                    className="bg-[#1A1933] border border-[#2A2850] rounded-2xl p-3 mb-4 cursor-pointer hover:border-[#C850C0]/40 transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#C850C0] shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[#EAEAF0] text-xs font-semibold truncate">{user.college}</p>
                            <p className="text-[#6B6B85] text-[10px] group-hover:text-[#A1A1B5] transition-colors">View campus feed →</p>
                        </div>
                    </div>
                </div>
            )}

            <SuggestedUsers />
        </div>
    )
}

export default RightSidebar