import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Heart, MessageCircle, Briefcase, Users, BarChart2, Plus, X, Clock, CheckCircle2, GraduationCap, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Trend of the Day ─────────────────────────────────────────────────────────
const extractHashtags = (posts) => {
    const freq = {};
    posts.forEach(p => {
        const tags = (p.caption || '').match(/#\w+/g) || [];
        tags.forEach(t => freq[t] = (freq[t] || 0) + 1);
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag]) => tag);
};

// ─── Post Card (minimal) ──────────────────────────────────────────────────────
const PostCard = ({ post }) => (
    <div className="bg-[#1A1933] rounded-2xl border border-[#2A2850] overflow-hidden hover:border-[#FF9933]/30 transition-all duration-300">
        <div className="flex items-center gap-3 p-3">
            <Avatar className="w-9 h-9 ring-1 ring-[#FF9933]/40">
                <AvatarImage src={post.author?.profilePicture} />
                <AvatarFallback className="bg-[#2A2850] text-white text-sm">{post.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/profile/${post.author?._id}`} className="font-semibold text-[#EAEAF0] text-sm hover:text-[#FF9933] transition-colors">{post.author?.username}</Link>
                    {post.author?.openToWork && (
                        <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">✅ Open to Work</span>
                    )}
                    {post.author?.college && (
                        <span className="text-[10px] text-[#A1A1B5]">📍 {post.author.college}</span>
                    )}
                </div>
                {post.mood && <span className="text-[10px] text-[#A1A1B5]">{post.mood}</span>}
            </div>
        </div>
        {post.image && <img src={post.image} alt="" className="w-full aspect-square object-cover" />}
        {post.caption && <p className="px-3 py-2 text-sm text-[#EAEAF0] leading-relaxed">{post.caption}</p>}
        <div className="flex items-center gap-4 px-3 pb-3 text-[#A1A1B5] text-xs">
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes?.length ?? 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments?.length ?? 0}</span>
        </div>
    </div>
);

// ─── Poll Card ────────────────────────────────────────────────────────────────
const PollCard = ({ poll, userId, onVote }) => {
    const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);
    const userVote = poll.options.findIndex(o => o.votes.some(v => (v._id || v) === userId));
    const expired = new Date() > new Date(poll.expiresAt);

    const timeLeft = () => {
        const diff = new Date(poll.expiresAt) - new Date();
        if (diff <= 0) return 'Expired';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${h}h ${m}m left`;
    };

    return (
        <div className="bg-[#1A1933] rounded-2xl border border-[#2A2850] p-4 hover:border-[#C850C0]/30 transition-all duration-300">
            <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[#EAEAF0] font-semibold text-sm leading-snug">{poll.question}</p>
                <span className="flex items-center gap-1 text-[10px] text-[#A1A1B5] shrink-0 mt-0.5">
                    <Clock className="w-3 h-3" />{timeLeft()}
                </span>
            </div>
            {!poll.isAnonymous && poll.author && (
                <p className="text-[10px] text-[#A1A1B5] mb-2">by @{poll.author.username} · {poll.author.college}</p>
            )}
            <div className="space-y-2">
                {poll.options.map((opt, i) => {
                    const pct = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                    const isMyVote = i === userVote;
                    return (
                        <button
                            key={i}
                            onClick={() => !expired && onVote(poll._id, i)}
                            disabled={expired}
                            className={`w-full relative rounded-xl px-3 py-2 text-left text-sm font-medium overflow-hidden transition-all duration-300 border ${isMyVote ? 'border-[#C850C0] text-[#EAEAF0]' : 'border-[#2A2850] text-[#A1A1B5] hover:border-[#C850C0]/40 hover:text-[#EAEAF0]'}`}
                        >
                            <div className="absolute inset-0 transition-all duration-500" style={{ width: `${pct}%`, background: isMyVote ? 'rgba(200,80,192,0.15)' : 'rgba(255,153,51,0.08)' }} />
                            <span className="relative flex items-center justify-between">
                                <span>{opt.text}</span>
                                <span className="text-[10px] font-bold text-[#A1A1B5]">{pct}%</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            <p className="text-[10px] text-[#6B6B85] mt-2">{totalVotes} votes · {poll.isAnonymous ? '🔒 Anonymous' : '👁 Public'}</p>
        </div>
    );
};

// ─── Create Poll Modal ─────────────────────────────────────────────────────────
const CreatePollModal = ({ onClose, onCreate, college }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!question.trim() || options.filter(o => o.trim()).length < 2) {
            toast.error('Add a question and at least 2 options');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/v1/poll/create', {
                question: question.trim(),
                options: options.filter(o => o.trim()),
                isAnonymous,
                college,
            }, { withCredentials: true });
            if (res.data.success) { toast.success('Poll created! 🗳️'); onCreate(res.data.poll); onClose(); }
        } catch { toast.error('Failed to create poll'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#16152a] border border-[#2A2850] rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#EAEAF0] font-bold">🗳️ New Poll</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-[#A1A1B5] hover:text-[#EAEAF0]" /></button>
                </div>
                <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask something..." className="w-full bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C850C0] placeholder:text-[#6B6B85] mb-3 transition-colors" />
                {options.map((opt, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }} placeholder={`Option ${i + 1}`} className="flex-1 bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C850C0] placeholder:text-[#6B6B85] transition-colors" />
                        {options.length > 2 && <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-[#6B6B85] hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>}
                    </div>
                ))}
                {options.length < 4 && (
                    <button onClick={() => setOptions([...options, ''])} className="text-[#C850C0] text-xs font-semibold flex items-center gap-1 mb-3 hover:text-[#ff79f0] transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add option
                    </button>
                )}
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <div onClick={() => setIsAnonymous(!isAnonymous)} className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${isAnonymous ? 'bg-[#C850C0]' : 'bg-[#2A2850]'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isAnonymous ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[#A1A1B5] text-sm">Anonymous poll</span>
                </label>
                <button onClick={submit} disabled={loading} className="w-full bg-gradient-to-r from-[#C850C0] to-[#FF9933] text-white font-semibold py-2.5 rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Poll'}
                </button>
            </div>
        </div>
    );
};

// ─── Main CampusPage ──────────────────────────────────────────────────────────
const TABS = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'polls', label: 'Polls', icon: '🗳️' },
    { id: 'collab', label: 'Collab', icon: '🤝' },
];

const CampusPage = () => {
    const { user } = useSelector(store => store.auth);
    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [polls, setPolls] = useState([]);
    const [openToWorkUsers, setOpenToWorkUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [trendTags, setTrendTags] = useState([]);

    const fetchCampusPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/v1/user/campus/posts', { withCredentials: true });
            if (res.data.success) {
                setPosts(res.data.posts);
                setTrendTags(extractHashtags(res.data.posts));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchPolls = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/v1/poll?college=${encodeURIComponent(user?.college || '')}`, { withCredentials: true });
            if (res.data.success) setPolls(res.data.polls);
        } catch (e) { console.error(e); }
    }, [user?.college]);

    const fetchOpenToWork = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/v1/user/suggested', { withCredentials: true });
            if (res.data.success) setOpenToWorkUsers(res.data.users.filter(u => u.openToWork));
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchCampusPosts();
        fetchPolls();
        fetchOpenToWork();
    }, [fetchCampusPosts, fetchPolls, fetchOpenToWork]);

    const handleVote = async (pollId, optionIndex) => {
        try {
            const res = await axios.post('http://localhost:3000/api/v1/poll/vote', { pollId, optionIndex }, { withCredentials: true });
            if (res.data.success) setPolls(prev => prev.map(p => p._id === pollId ? res.data.poll : p));
        } catch { toast.error('Vote failed'); }
    };

    const displayedPosts = posts;

    const collabPosts = posts.filter(p =>
        (p.caption || '').toLowerCase().includes('#collaborate') ||
        (p.caption || '').toLowerCase().includes('#hackathon') ||
        (p.caption || '').toLowerCase().includes('#teammate') ||
        (p.caption || '').toLowerCase().includes('#collab')
    );

    const careerPosts = posts.filter(p =>
        (p.caption || '').toLowerCase().includes('#career') ||
        (p.caption || '').toLowerCase().includes('#internship') ||
        (p.caption || '').toLowerCase().includes('#job') ||
        (p.caption || '').toLowerCase().includes('#opportunity') ||
        p.author?.openToWork
    );

    return (
        <div className="flex-1 max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-[#EAEAF0] font-bold text-xl flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-[#FF9933]" /> Campus
                    </h1>
                    <p className="text-[#A1A1B5] text-sm">
                        {user?.college ? `📍 ${user.college}` : 'Set your college in Edit Profile'}
                    </p>
                </div>
            </div>

            {/* Trend of the Day */}
            {trendTags.length > 0 && (
                <div className="bg-gradient-to-r from-[#FF9933]/10 to-[#C850C0]/10 border border-[#FF9933]/20 rounded-2xl p-3 mb-4 flex items-center gap-3">
                    <span className="text-xl">🔥</span>
                    <div>
                        <p className="text-[#FF9933] text-xs font-bold uppercase tracking-wider">Trend of the Day</p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                            {trendTags.map(t => <span key={t} className="text-[#EAEAF0] text-sm font-semibold">{t}</span>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-[#0B0A1A] p-1 rounded-2xl mb-4">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white shadow-lg'
                                : 'text-[#A1A1B5] hover:text-[#EAEAF0]'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Feed Tab ── */}
            {activeTab === 'feed' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-[#FF9933] border-t-transparent animate-spin" /></div>
                    ) : displayedPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <GraduationCap className="w-12 h-12 mx-auto text-[#2A2850] mb-3" />
                            <p className="text-[#A1A1B5] text-sm">
                                {user?.college ? 'No campus posts yet. Be the first!' : 'Set your college in Edit Profile to see campus posts.'}
                            </p>
                            {!user?.college && <Link to="/account/edit" className="mt-3 inline-block text-[#FF9933] text-sm font-semibold hover:underline">Go to Edit Profile →</Link>}
                        </div>
                    ) : (
                        displayedPosts.map(post => <PostCard key={post._id} post={post} />)
                    )}
                </div>
            )}

            {/* ── Career Tab ── */}
            {activeTab === 'career' && (
                <div className="space-y-4">
                    {/* Open to Work Users */}
                    {openToWorkUsers.length > 0 && (
                        <div>
                            <h3 className="text-[#EAEAF0] font-bold text-sm mb-2 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-green-400" /> Open to Work</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {openToWorkUsers.slice(0, 6).map(u => (
                                    <Link key={u._id} to={`/profile/${u._id}`} className="bg-[#1A1933] border border-[#2A2850] hover:border-green-500/30 rounded-2xl p-3 flex items-center gap-3 transition-all duration-300">
                                        <Avatar className="w-9 h-9 ring-1 ring-green-500/40">
                                            <AvatarImage src={u.profilePicture} />
                                            <AvatarFallback className="bg-[#2A2850] text-white text-sm">{u.username?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-[#EAEAF0] text-xs font-semibold truncate">{u.username}</p>
                                            <p className="text-green-400 text-[10px] font-semibold">✅ Open to Work</p>
                                            {u.college && <p className="text-[#6B6B85] text-[10px] truncate">{u.college}</p>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Career posts */}
                    <div>
                        <h3 className="text-[#EAEAF0] font-bold text-sm mb-2 flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-[#FF9933]" /> Opportunities</h3>
                        {careerPosts.length === 0 ? (
                            <div className="text-center py-12 text-[#A1A1B5] text-sm">
                                <p>No career posts yet.</p>
                                <p className="text-xs mt-1">Post with #internship or #career to appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">{careerPosts.map(p => <PostCard key={p._id} post={p} />)}</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Polls Tab ── */}
            {activeTab === 'polls' && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[#EAEAF0] font-bold text-sm">Campus Polls</h3>
                        <button onClick={() => setShowPollModal(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C850C0] bg-[#C850C0]/10 border border-[#C850C0]/30 px-3 py-1.5 rounded-full hover:bg-[#C850C0]/20 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> New Poll
                        </button>
                    </div>
                    <div className="space-y-3">
                        {polls.length === 0 ? (
                            <div className="text-center py-12 text-[#A1A1B5] text-sm">
                                <p>No polls yet. Start one!</p>
                            </div>
                        ) : polls.map(poll => (
                            <PollCard key={poll._id} poll={poll} userId={user?._id} onVote={handleVote} />
                        ))}
                    </div>
                    {showPollModal && (
                        <CreatePollModal
                            college={user?.college}
                            onClose={() => setShowPollModal(false)}
                            onCreate={newPoll => setPolls(prev => [newPoll, ...prev])}
                        />
                    )}
                </div>
            )}

            {/* ── Collab Tab ── */}
            {activeTab === 'collab' && (
                <div>
                    <div className="bg-gradient-to-r from-[#C850C0]/10 to-[#FF9933]/10 border border-[#C850C0]/20 rounded-2xl p-4 mb-4">
                        <p className="text-[#EAEAF0] font-bold text-sm mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-[#C850C0]" />Find Your Team</p>
                        <p className="text-[#A1A1B5] text-xs">Posts tagged with <span className="text-[#FF9933] font-semibold">#collaborate</span>, <span className="text-[#FF9933] font-semibold">#teammate</span>, or <span className="text-[#FF9933] font-semibold">#hackathon</span> appear here.</p>
                    </div>
                    {collabPosts.length === 0 ? (
                        <div className="text-center py-12 text-[#A1A1B5] text-sm">
                            <Users className="w-10 h-10 mx-auto text-[#2A2850] mb-3" />
                            <p>No collaboration posts yet.</p>
                            <p className="text-xs mt-1">Post with #hackathon or #teammate to appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">{collabPosts.map(p => <PostCard key={p._id} post={p} />)}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CampusPage;
