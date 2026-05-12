import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Medal, Zap, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';

const LEVEL_NAMES = ['Rookie', 'Explorer', 'Builder', 'Hustler', 'Achiever', 'Elite', 'Master', 'Champion', 'Legend', 'GOAT'];
const LEVEL_ICONS = ['🌱', '🚀', '🔨', '💪', '🏅', '⚡', '🎯', '🏆', '💎', '👑'];

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const RANK_BG = ['bg-yellow-500/10 border-yellow-500/30', 'bg-gray-500/10 border-gray-500/20', 'bg-amber-700/10 border-amber-700/20'];

const LeaderboardPage = () => {
    const { user } = useSelector(store => store.auth);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'college'

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const college = filter === 'college' && user?.college ? user.college : '';
            const res = await axios.get(
                `${API_BASE_URL}/api/v1/challenge/leaderboard?college=${encodeURIComponent(college)}`,
                { withCredentials: true }
            );
            if (res.data.success) setUsers(res.data.users);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filter, user?.college]);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    const myRank = users.findIndex(u => u._id === user?._id) + 1;

    return (
        <div className="flex-1 max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-4">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[#EAEAF0] font-bold text-xl flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-[#FF9933]" /> Leaderboard
                </h1>
                <p className="text-[#A1A1B5] text-sm">Top creators ranked by XP</p>
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-[#0B0A1A] rounded-2xl p-1 mb-5 border border-[#2A2850]">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${filter === 'all' ? 'bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white shadow' : 'text-[#A1A1B5] hover:text-[#EAEAF0]'}`}
                >
                    🌍 Global
                </button>
                <button
                    onClick={() => setFilter('college')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${filter === 'college' ? 'bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white shadow' : 'text-[#A1A1B5] hover:text-[#EAEAF0]'}`}
                >
                    <GraduationCap className="w-4 h-4" /> My College
                </button>
            </div>

            {/* My Rank Card */}
            {myRank > 0 && (
                <div className="bg-gradient-to-r from-[#FF9933]/10 to-[#C850C0]/10 border border-[#FF9933]/30 rounded-2xl p-4 mb-5 flex items-center gap-3">
                    <span className="text-3xl">{LEVEL_ICONS[(user?.level ?? 1) - 1] || '🌱'}</span>
                    <div className="flex-1">
                        <p className="text-[#EAEAF0] font-bold text-sm">Your Rank</p>
                        <p className="text-[#A1A1B5] text-xs">{user?.username} · {user?.xp ?? 0} XP · Level {user?.level ?? 1}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#FF9933] font-bold text-2xl">#{myRank}</p>
                        <p className="text-[#A1A1B5] text-xs">of {users.length}</p>
                    </div>
                </div>
            )}

            {/* Top 3 Podium */}
            {!loading && users.length >= 3 && (
                <div className="flex items-end justify-center gap-3 mb-6">
                    {/* 2nd */}
                    <div className="flex flex-col items-center gap-1">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-400/50">
                            <AvatarImage src={users[1]?.profilePicture} />
                            <AvatarFallback className="bg-[#2A2850] text-white">{users[1]?.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-lg">🥈</span>
                        <p className="text-[#EAEAF0] text-xs font-semibold truncate max-w-[70px] text-center">{users[1]?.username}</p>
                        <p className="text-[#A1A1B5] text-[10px]">{users[1]?.xp} XP</p>
                        <div className="h-12 w-16 bg-gray-500/20 border border-gray-500/30 rounded-t-xl" />
                    </div>
                    {/* 1st */}
                    <div className="flex flex-col items-center gap-1 -mb-2">
                        <div className="relative">
                            <Avatar className="w-16 h-16 ring-2 ring-yellow-400/60">
                                <AvatarImage src={users[0]?.profilePicture} />
                                <AvatarFallback className="bg-[#2A2850] text-white text-lg">{users[0]?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
                        </div>
                        <span className="text-xl mt-1">🥇</span>
                        <p className="text-[#EAEAF0] text-sm font-bold truncate max-w-[80px] text-center">{users[0]?.username}</p>
                        <p className="text-[#FF9933] text-[10px] font-bold">{users[0]?.xp} XP</p>
                        <div className="h-20 w-20 bg-yellow-500/10 border border-yellow-500/30 rounded-t-xl" />
                    </div>
                    {/* 3rd */}
                    <div className="flex flex-col items-center gap-1">
                        <Avatar className="w-12 h-12 ring-2 ring-amber-600/50">
                            <AvatarImage src={users[2]?.profilePicture} />
                            <AvatarFallback className="bg-[#2A2850] text-white">{users[2]?.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-lg">🥉</span>
                        <p className="text-[#EAEAF0] text-xs font-semibold truncate max-w-[70px] text-center">{users[2]?.username}</p>
                        <p className="text-[#A1A1B5] text-[10px]">{users[2]?.xp} XP</p>
                        <div className="h-8 w-16 bg-amber-700/20 border border-amber-700/30 rounded-t-xl" />
                    </div>
                </div>
            )}

            {/* Full List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#FF9933] border-t-transparent animate-spin" /></div>
            ) : users.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1B5] text-sm">
                    <Trophy className="w-12 h-12 mx-auto text-[#2A2850] mb-3" />
                    <p>{filter === 'college' && !user?.college ? 'Set your college in Edit Profile first.' : 'No users on the leaderboard yet!'}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map((u, i) => {
                        const isMe = u._id === user?._id;
                        const rank = i + 1;
                        return (
                            <Link
                                key={u._id}
                                to={`/profile/${u._id}`}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                                    rank <= 3 ? RANK_BG[rank - 1] : 'bg-[#1A1933] border-[#2A2850] hover:border-[#FF9933]/20'
                                } ${isMe ? 'ring-1 ring-[#FF9933]/50' : ''}`}
                            >
                                {/* Rank */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank <= 3 ? `${RANK_COLORS[rank - 1]} bg-current/10` : 'text-[#6B6B85] bg-[#2A2850]'}`}>
                                    {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
                                </div>
                                <Avatar className="w-9 h-9">
                                    <AvatarImage src={u.profilePicture} />
                                    <AvatarFallback className="bg-[#2A2850] text-white text-sm">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className={`font-semibold text-sm truncate ${isMe ? 'text-[#FF9933]' : 'text-[#EAEAF0]'}`}>{u.username}{isMe && ' (You)'}</p>
                                        <span className="text-xs">{LEVEL_ICONS[(u.level ?? 1) - 1]}</span>
                                        {u.badges?.[0] && <span className="text-[10px] text-[#A1A1B5] truncate max-w-[80px]">{u.badges[0]}</span>}
                                    </div>
                                    {u.college && <p className="text-[#6B6B85] text-xs truncate">{u.college}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-0.5 text-[#FF9933] font-bold text-sm justify-end">
                                        <Zap className="w-3.5 h-3.5" />{u.xp}
                                    </div>
                                    <p className="text-[#6B6B85] text-[10px]">Lv.{u.level ?? 1} {LEVEL_NAMES[(u.level ?? 1) - 1]}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;
