import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle2, Zap, Trophy, Lock } from 'lucide-react';
import { setAuthUser } from '@/redux/authSlice';
import { API_BASE_URL } from '@/lib/api';

const LEVEL_NAMES = ['Rookie', 'Explorer', 'Builder', 'Hustler', 'Achiever', 'Elite', 'Master', 'Champion', 'Legend', 'GOAT'];
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];

const XPBar = ({ xp, level }) => {
    const current = LEVEL_THRESHOLDS[level - 1] || 0;
    const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
    return (
        <div className="bg-[#1A1933] border border-[#2A2850] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{level <= 10 ? ['🌱','🚀','🔨','💪','🏅','⚡','🎯','🏆','💎','👑'][level - 1] : '👑'}</span>
                    <div>
                        <p className="text-[#EAEAF0] font-bold text-sm">Level {level} · {LEVEL_NAMES[level - 1] || 'GOAT'}</p>
                        <p className="text-[#A1A1B5] text-xs">{xp} XP total</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[#FF9933] font-bold text-sm">{pct}%</p>
                    <p className="text-[#6B6B85] text-xs">to Level {level + 1}</p>
                </div>
            </div>
            <div className="w-full h-2.5 bg-[#2A2850] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[#6B6B85] text-xs mt-1.5">{next - xp} XP to next level</p>
        </div>
    );
};

const ChallengeCard = ({ challenge, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const done = challenge.completed || justCompleted;

    const handleComplete = async () => {
        if (done || loading) return;
        setVerifyError('');
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/challenge/${challenge._id}/complete`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                setJustCompleted(true);
                onComplete(res.data);
                toast.success(`${challenge.emoji} +${res.data.xpEarned} XP earned!`);
            }
        } catch (e) {
            const msg = e.response?.data?.message || 'Failed';
            if (e.response?.data?.notVerified) {
                setVerifyError(msg);
            } else {
                toast.error(msg);
            }
        } finally { setLoading(false); }
    };

    const isPoll = challenge.type === 'poll';

    return (
        <div className={`relative bg-[#1A1933] border rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${done ? 'border-green-500/30 opacity-70' : verifyError ? 'border-red-500/30' : 'border-[#2A2850] hover:border-[#FF9933]/30'}`}>
            {done && (
                <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
            )}
            <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{challenge.emoji}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-[#EAEAF0] font-bold text-sm">{challenge.title}</p>
                    <p className="text-[#A1A1B5] text-xs mt-0.5 leading-snug">{challenge.description}</p>
                    {challenge.requiredTag && (
                        <span className="inline-block mt-1.5 text-[10px] font-bold bg-[#FF9933]/10 border border-[#FF9933]/30 text-[#FF9933] px-2 py-0.5 rounded-full">
                            Required: {challenge.requiredTag}
                        </span>
                    )}
                    {verifyError && (
                        <p className="text-red-400 text-[10px] mt-1.5 leading-snug">
                            ⚠️ {verifyError}
                        </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-[#FF9933] text-xs font-bold bg-[#FF9933]/10 px-2.5 py-1 rounded-full">
                            <Zap className="w-3.5 h-3.5" />+{challenge.xpReward} XP
                        </div>
                        {done ? (
                            <span className="text-green-400 text-xs font-bold">✅ Done!</span>
                        ) : isPoll ? (
                            <span className="text-[#C850C0] text-xs font-semibold bg-[#C850C0]/10 px-3 py-1 rounded-full border border-[#C850C0]/30">
                                🗳️ Auto on poll creation
                            </span>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {loading ? '...' : 'Claim XP'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengesPage = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/challenge`, { withCredentials: true });
            if (res.data.success) setChallenges(res.data.challenges);
        } catch (e) { console.error(e); toast.error('Failed to load challenges'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

    const handleComplete = (data) => {
        // Update user XP in Redux
        dispatch(setAuthUser({ ...user, xp: data.newXP, level: data.newLevel, badges: data.newBadges }));
    };

    const completedCount = challenges.filter(c => c.completed).length;
    const totalXP = challenges.filter(c => c.completed).reduce((s, c) => s + c.xpReward, 0);

    return (
        <div className="flex-1 max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-4">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[#EAEAF0] font-bold text-xl flex items-center gap-2 mb-1">
                    <Trophy className="w-6 h-6 text-[#FF9933]" /> Daily Challenges
                </h1>
                <p className="text-[#A1A1B5] text-sm">Complete challenges to earn XP and unlock badges. Resets daily!</p>
            </div>

            {/* XP Bar */}
            <XPBar xp={user?.xp ?? 0} level={user?.level ?? 1} />

            {/* Badges */}
            {user?.badges?.length > 0 && (
                <div className="bg-[#1A1933] border border-[#2A2850] rounded-2xl p-4 mb-4">
                    <p className="text-[#EAEAF0] font-bold text-sm mb-2">🏅 Your Badges</p>
                    <div className="flex flex-wrap gap-2">
                        {user.badges.map((badge, i) => (
                            <span key={i} className="text-xs bg-[#FF9933]/10 border border-[#FF9933]/30 text-[#FF9933] px-2.5 py-1 rounded-full font-semibold">{badge}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress today */}
            {challenges.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-[#0B0A1A] rounded-xl p-3 text-center border border-[#2A2850]">
                        <p className="text-[#FF9933] font-bold text-xl">{completedCount}/{challenges.length}</p>
                        <p className="text-[#A1A1B5] text-xs">Done Today</p>
                    </div>
                    <div className="flex-1 bg-[#0B0A1A] rounded-xl p-3 text-center border border-[#2A2850]">
                        <p className="text-[#FF9933] font-bold text-xl">{totalXP}</p>
                        <p className="text-[#A1A1B5] text-xs">XP Earned</p>
                    </div>
                    <div className="flex-1 bg-[#0B0A1A] rounded-xl p-3 text-center border border-[#2A2850]">
                        <p className="text-[#FF9933] font-bold text-xl">{user?.level ?? 1}</p>
                        <p className="text-[#A1A1B5] text-xs">Your Level</p>
                    </div>
                </div>
            )}

            {/* Challenges list */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-[#FF9933] border-t-transparent animate-spin" /></div>
            ) : (
                <div className="space-y-3">
                    {challenges.map(c => (
                        <ChallengeCard key={c._id} challenge={c} onComplete={handleComplete} />
                    ))}
                </div>
            )}

            {/* Locked hint */}
            <div className="mt-6 bg-[#0B0A1A] border border-[#2A2850] border-dashed rounded-2xl p-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#6B6B85] shrink-0" />
                <p className="text-[#6B6B85] text-xs">More challenges unlock as you level up. Come back tomorrow for new ones!</p>
            </div>
        </div>
    );
};

export default ChallengesPage;
