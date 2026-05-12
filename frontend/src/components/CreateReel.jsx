import React, { useState, useRef } from 'react';
import { X, Film, Loader2, Music, Globe, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'];
const MOODS = [
    { emoji: '🔥', label: 'Lit' },
    { emoji: '😂', label: 'Funny' },
    { emoji: '🌸', label: 'Aesthetic' },
    { emoji: '😌', label: 'Chill' },
    { emoji: '💡', label: 'Inspiring' },
    { emoji: '💀', label: 'Savage' },
];
const CAPTION_SUGGESTIONS = [
    'Living my best life ✨ #reels #vibes #blessed',
    'Moments like these 🎬 #reel #video #trending',
    'Just captured this 📸🎥 #explore #fyp #viral',
    'This one hits different 🔥 #content #creator #reels',
];

const CreateReel = ({ onClose, onReelCreated }) => {
    const { user } = useSelector(store => store.auth);
    const [step, setStep] = useState(1); // 1: Select, 2: Details
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [caption, setCaption] = useState('');
    const [language, setLanguage] = useState('English');
    const [mood, setMood] = useState('');
    const [musicTitle, setMusicTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestingCaption, setSuggestingCaption] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            toast.error('Please select a video file (MP4, WebM, MOV)');
            return;
        }
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            toast.error('Video must be under 100MB');
            return;
        }

        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
        setStep(2);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const handleSuggestCaption = () => {
        setSuggestingCaption(true);
        setTimeout(() => {
            const rand = CAPTION_SUGGESTIONS[Math.floor(Math.random() * CAPTION_SUGGESTIONS.length)];
            setCaption(rand);
            setSuggestingCaption(false);
        }, 600);
    };

    const handleSubmit = async () => {
        if (!videoFile) { toast.error('Please select a video'); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('caption', caption);
            formData.append('language', language);
            formData.append('mood', mood);
            formData.append('musicTitle', musicTitle || 'Original Audio');

            const res = await axios.post(
                'http://localhost:3000/api/v1/reel/upload',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                    onUploadProgress: (e) => {
                        const pct = Math.round((e.loaded * 100) / e.total);
                        setUploadProgress(pct);
                    },
                }
            );

            if (res.data.success) {
                toast.success('Reel uploaded successfully! 🎬');
                onReelCreated?.();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload reel');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#16152a] border border-[#2A2850] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] w-full max-w-lg overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2850]">
                    <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-[#FF9933]" />
                        <h2 className="text-[#EAEAF0] font-semibold text-base">
                            {step === 1 ? 'Create Reel' : 'Reel Details'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#2A2850] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#A1A1B5] hover:text-[#EAEAF0]" />
                    </button>
                </div>

                {/* Step 1: Select Video */}
                {step === 1 && (
                    <div className="p-6">
                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#2A2850] hover:border-[#FF9933] rounded-2xl p-10 flex flex-col items-center gap-5 cursor-pointer transition-all duration-300 group bg-[#0B0A1A] hover:bg-[#1A1933]"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9933]/20 to-[#C850C0]/20 flex items-center justify-center ring-2 ring-[#2A2850] group-hover:ring-[#FF9933]/50 transition-all">
                                <Film className="w-10 h-10 text-[#A1A1B5] group-hover:text-[#FF9933] transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-[#EAEAF0] text-lg font-semibold">Drop your video here</p>
                                <p className="text-[#A1A1B5] text-sm mt-1">or click to browse</p>
                                <p className="text-[#6B6B85] text-xs mt-2">MP4 · WebM · MOV · Max 100MB</p>
                            </div>
                            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white font-semibold text-sm shadow-lg">
                                Select Video
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="max-h-[75vh] overflow-y-auto no-scrollbar">
                        {/* Video preview */}
                        <div className="relative bg-black flex items-center justify-center" style={{ height: '220px' }}>
                            <video
                                src={videoPreview}
                                className="h-full mx-auto object-contain"
                                controls
                                style={{ maxHeight: '220px' }}
                            />
                            <button
                                onClick={() => { setStep(1); setVideoFile(null); setVideoPreview(''); }}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Author info */}
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 ring-1 ring-[#FF9933]/50">
                                    <AvatarImage src={user?.profilePicture} />
                                    <AvatarFallback className="bg-[#2A2850] text-white text-xs">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[#FF9933] font-semibold text-sm">{user?.username}</span>
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider block mb-1.5">Caption</label>
                                <Textarea
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    placeholder="Write something about your reel..."
                                    className="resize-none bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] focus-visible:ring-1 focus-visible:ring-[#FF9933] placeholder:text-[#6B6B85] rounded-xl"
                                    rows={3}
                                />
                                <button
                                    onClick={handleSuggestCaption}
                                    disabled={suggestingCaption}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C850C0] hover:text-[#ff79f0] mt-1.5 transition-colors disabled:opacity-50"
                                >
                                    {suggestingCaption ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    Suggest caption
                                </button>
                            </div>

                            {/* Music / Audio */}
                            <div>
                                <label className="text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                    <Music className="w-3.5 h-3.5" /> Audio Title
                                </label>
                                <input
                                    value={musicTitle}
                                    onChange={e => setMusicTitle(e.target.value)}
                                    placeholder="Original Audio"
                                    className="w-full bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF9933] placeholder:text-[#6B6B85] transition-colors"
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <label className="text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5" /> Language
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                                language === lang
                                                    ? 'bg-[#FF9933]/20 border-[#FF9933] text-[#FF9933] shadow-[0_0_8px_rgba(255,153,51,0.3)]'
                                                    : 'border-[#2A2850] text-[#A1A1B5] hover:border-[#FF9933]/50 hover:text-[#FF9933]'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood */}
                            <div>
                                <label className="text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider block mb-1.5">Mood</label>
                                <div className="flex flex-wrap gap-2">
                                    {MOODS.map(m => (
                                        <button
                                            key={m.label}
                                            onClick={() => setMood(mood === m.label ? '' : m.label)}
                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                                mood === m.label
                                                    ? 'bg-[#C850C0]/20 border-[#C850C0] text-[#C850C0] shadow-[0_0_8px_rgba(200,80,192,0.3)]'
                                                    : 'border-[#2A2850] text-[#A1A1B5] hover:border-[#C850C0]/50 hover:text-[#C850C0]'
                                            }`}
                                        >
                                            <span>{m.emoji}</span> {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {step === 2 && (
                    <div className="px-5 py-4 border-t border-[#2A2850] bg-[#16152a]">
                        {/* Upload progress */}
                        {loading && uploadProgress > 0 && (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-[#A1A1B5] mb-1">
                                    <span>Uploading to Cloudinary...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#2A2850] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#FF9933] to-[#C850C0] transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose} disabled={loading}
                                className="flex-1 border-[#2A2850] text-[#A1A1B5] hover:bg-[#2A2850] hover:text-[#EAEAF0] rounded-xl">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !videoFile}
                                className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 shadow-[0_4px_20px_rgba(255,153,51,0.3)]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    'Share Reel 🎬'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateReel;
