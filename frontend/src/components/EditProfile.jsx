import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { Loader2, Briefcase, GraduationCap, Code2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';
import ImageCropper from './ImageCropper';
import { API_BASE_URL } from '@/lib/api';

const POPULAR_COLLEGES = [
    'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
    'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'BITS Pilani', 'BITS Goa',
    'Delhi University', 'Mumbai University', 'Pune University', 'Anna University',
    'VIT Vellore', 'SRM University', 'Manipal University', 'Amity University',
    'Chandigarh University', 'LPU', 'Lovely Professional University',
    'Christ University', 'Symbiosis', 'NMIMS', 'Jadavpur University',
];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Alumni'];

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState('');
    const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio || '',
        gender: user?.gender || '',
        college: user?.college || '',
        yearOfStudy: user?.yearOfStudy || '',
        skills: (user?.skills || []).join(', '),
        openToWork: user?.openToWork || false,
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const filteredColleges = POPULAR_COLLEGES.filter(c =>
        c.toLowerCase().includes(input.college.toLowerCase()) && input.college.length > 0
    ).slice(0, 6);

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { setRawImageSrc(e.target.result); setShowCropper(true); };
            reader.readAsDataURL(file);
        }
    }
    const handleCropComplete = (croppedFile) => { setInput({ ...input, profilePhoto: croppedFile }); setShowCropper(false); }
    const handleCropCancel = () => { setShowCropper(false); setRawImageSrc(''); imageRef.current.value = ''; }

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        formData.append("college", input.college);
        formData.append("yearOfStudy", input.yearOfStudy);
        formData.append("skills", input.skills);
        formData.append("openToWork", input.openToWork);
        if (input.profilePhoto instanceof File) formData.append("profilePhoto", input.profilePhoto);

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/api/v1/user/profile/edit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser({ ...user, ...res.data.user }));
                navigate(`/profile/${user?._id}`);
                toast.success('Profile updated! ✅');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    }

    return (
        <>
            <div className="flex max-w-2xl mx-auto pl-10">
                <section className="flex flex-col gap-5 w-full my-8">
                    <h1 className="font-bold text-xl text-[#EAEAF0]">Edit Profile</h1>

                    {/* Avatar + Change Photo */}
                    <div className="flex items-center justify-between bg-[#1A1933] border border-[#2A2850] rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-14 h-14 ring-2 ring-[#FF9933]/40">
                                <AvatarImage src={input.profilePhoto instanceof File ? URL.createObjectURL(input.profilePhoto) : input.profilePhoto} alt="avatar" />
                                <AvatarFallback className="bg-[#2A2850] text-white text-xl">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="font-bold text-sm text-[#EAEAF0]">{user?.username}</h1>
                                <span className="text-[#A1A1B5] text-xs">{user?.bio || 'Add a bio below'}</span>
                            </div>
                        </div>
                        <input ref={imageRef} onChange={fileChangeHandler} type="file" className="hidden" accept="image/*" />
                        <Button onClick={() => imageRef?.current.click()} className="bg-[#FF9933]/10 border border-[#FF9933]/30 text-[#FF9933] hover:bg-[#FF9933]/20 h-8 text-sm font-semibold">
                            Change Photo
                        </Button>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider mb-1.5">Bio</label>
                        <Textarea
                            value={input.bio}
                            onChange={(e) => setInput({ ...input, bio: e.target.value })}
                            placeholder="Tell your campus who you are..."
                            className="bg-[#0B0A1A] text-[#EAEAF0] border-[#2A2850] focus-visible:ring-[#FF9933] placeholder:text-[#6B6B85] rounded-xl"
                            rows={3}
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider mb-1.5">Gender</label>
                        <Select defaultValue={input.gender} onValueChange={v => setInput({ ...input, gender: v })}>
                            <SelectTrigger className="bg-[#0B0A1A] border-[#2A2850] text-[#EAEAF0] rounded-xl focus:ring-[#FF9933]">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#16152a] border-[#2A2850] text-[#EAEAF0]">
                                <SelectGroup>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ─── Campus Section ─── */}
                    <div className="border-t border-[#2A2850] pt-5">
                        <h2 className="text-[#EAEAF0] font-bold text-base mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-[#FF9933]" /> Campus Info
                        </h2>

                        {/* College */}
                        <div className="relative mb-4">
                            <label className="block text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider mb-1.5">College / University</label>
                            <input
                                value={input.college}
                                onChange={e => { setInput({ ...input, college: e.target.value }); setShowCollegeSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 200)}
                                onFocus={() => setShowCollegeSuggestions(true)}
                                placeholder="e.g. IIT Bombay, VIT Vellore..."
                                className="w-full bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF9933] placeholder:text-[#6B6B85] transition-colors"
                            />
                            {showCollegeSuggestions && filteredColleges.length > 0 && (
                                <div className="absolute z-20 w-full bg-[#16152a] border border-[#2A2850] rounded-xl shadow-xl mt-1 overflow-hidden">
                                    {filteredColleges.map(c => (
                                        <button key={c} onMouseDown={() => { setInput({ ...input, college: c }); setShowCollegeSuggestions(false); }} className="w-full text-left px-3 py-2.5 text-sm text-[#EAEAF0] hover:bg-[#FF9933]/10 hover:text-[#FF9933] transition-colors">
                                            🎓 {c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Year of Study */}
                        <div className="mb-4">
                            <label className="block text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider mb-1.5">Year of Study</label>
                            <div className="flex flex-wrap gap-2">
                                {YEAR_OPTIONS.map(yr => (
                                    <button key={yr} onClick={() => setInput({ ...input, yearOfStudy: input.yearOfStudy === yr ? '' : yr })}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${input.yearOfStudy === yr ? 'bg-[#FF9933]/20 border-[#FF9933] text-[#FF9933]' : 'border-[#2A2850] text-[#A1A1B5] hover:border-[#FF9933]/40 hover:text-[#FF9933]'}`}>
                                        {yr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                            <label className="block text-[#A1A1B5] text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Code2 className="w-3.5 h-3.5" /> Skills (comma-separated)
                            </label>
                            <input
                                value={input.skills}
                                onChange={e => setInput({ ...input, skills: e.target.value })}
                                placeholder="JavaScript, React, Python, DSA..."
                                className="w-full bg-[#0B0A1A] text-[#EAEAF0] border border-[#2A2850] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF9933] placeholder:text-[#6B6B85] transition-colors"
                            />
                            {/* Preview */}
                            {input.skills && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {input.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                        <span key={s} className="text-xs bg-[#FF9933]/10 border border-[#FF9933]/30 text-[#FF9933] px-2 py-0.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Open to Work */}
                        <div className="flex items-center justify-between bg-[#0B0A1A] border border-[#2A2850] rounded-2xl p-4 mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${input.openToWork ? 'bg-green-500/15' : 'bg-[#2A2850]'}`}>
                                    <Briefcase className={`w-5 h-5 ${input.openToWork ? 'text-green-400' : 'text-[#6B6B85]'}`} />
                                </div>
                                <div>
                                    <p className="text-[#EAEAF0] font-semibold text-sm">Open to Work</p>
                                    <p className="text-[#A1A1B5] text-xs">Show recruiters you're available</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setInput({ ...input, openToWork: !input.openToWork })}
                                className={`w-12 h-6 rounded-full transition-colors duration-300 relative shrink-0 ${input.openToWork ? 'bg-green-500' : 'bg-[#2A2850]'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${input.openToWork ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            onClick={editProfileHandler}
                            disabled={loading}
                            className="bg-gradient-to-r from-[#FF9933] to-[#C850C0] text-white font-bold px-8 hover:brightness-110 shadow-[0_4px_20px_rgba(255,153,51,0.3)] rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Save Profile</>}
                        </Button>
                    </div>
                </section>
            </div>

            {showCropper && (
                <ImageCropper imageSrc={rawImageSrc} onCropComplete={handleCropComplete} onCancel={handleCropCancel} aspect={1} />
            )}
        </>
    )
}

export default EditProfile
