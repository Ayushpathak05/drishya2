import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, ArrowLeft, ImagePlus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const MOODS = [
  { emoji: '🔥', label: 'Lit' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '🌸', label: 'Aesthetic' },
  { emoji: '😌', label: 'Chill' },
  { emoji: '💡', label: 'Inspiring' },
  { emoji: '💀', label: 'Savage' },
];

const CAPTION_SUGGESTIONS = [
  'Living my best life ✨ #vibes #lifestyle #blessed',
  'Good vibes only 🌊 #selfcare #mood #happy',
  'Creating memories that last forever 📸 #love #moments #life',
  'Chasing the sun 🌅 #golden #naturelover #explore',
  'Still dreaming bigger 🚀 #goals #motivation #grind',
  'Found my happy place 🌿 #peace #mindfulness #zen',
];

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [step, setStep] = useState(1); // 1: Select, 2: Crop, 3: Caption
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [suggestingCaption, setSuggestingCaption] = useState(false);

  // Crop state
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const currentImgRef = useRef(null);

  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resetForm = () => {
    setStep(1);
    setFile("");
    setCaption("");
    setImagePreview("");
    setRawImageSrc("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    setSelectedMood('');
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  }

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setRawImageSrc(dataUrl);
      setStep(2);
    }
  }

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    );
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  }

  const handleCropNext = async () => {
    if (!completedCrop || !currentImgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = currentImgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0,
      completedCrop.width, completedCrop.height
    );

    canvas.toBlob((blob) => {
      if(blob) {
        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        setFile(croppedFile);
        
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(croppedFile);
        
        setStep(3);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleSuggestCaption = () => {
    setSuggestingCaption(true);
    setTimeout(() => {
      const rand = CAPTION_SUGGESTIONS[Math.floor(Math.random() * CAPTION_SUGGESTIONS.length)];
      setCaption(rand);
      setSuggestingCaption(false);
    }, 700);
  };

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (selectedMood) formData.append("mood", selectedMood);
    if (imagePreview) formData.append("image", file);
    
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/v1/post/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        handleClose();
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={handleClose} className="max-w-xl p-0 overflow-hidden border border-[#2A2850] shadow-2xl bg-[#16152a] text-[#EAEAF0]">
        
        {/* Dynamic Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#2A2850]">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="text-[#A1A1B5] hover:text-[#EAEAF0] transition-colors">
                  <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
                <div className="w-6" />
            )}
            
            <h2 className="font-semibold text-base py-1 text-[#EAEAF0]">
                {step === 1 ? 'Create new post' : step === 2 ? 'Crop' : 'New post'}
            </h2>
            
            {step === 2 && (
               <button onClick={handleCropNext} className="text-[#FF9933] font-semibold hover:text-[#ffb347] transition-colors">
                   Next
               </button>
            )}
            {step === 3 && (
               <button onClick={createPostHandler} disabled={loading} className="text-[#FF9933] font-semibold hover:text-[#ffb347] transition-colors">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Share'}
               </button>
            )}
            {step === 1 && <div className="w-6" />}
        </div>

        {/* Body Content */}
        <div className="min-h-[400px] flex flex-col">
            
            {/* Step 1: Select */}
            {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="w-24 h-24 rounded-full bg-[#1F1E3A] flex items-center justify-center ring-2 ring-[#2A2850]">
                      <ImagePlus className="w-12 h-12 text-[#A1A1B5]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-light text-[#EAEAF0]">Drag photos and videos here</h3>
                    <input ref={imageRef} type='file' className='hidden' accept="image/*" onChange={fileChangeHandler} />
                    <Button onClick={() => imageRef.current.click()} className="bg-gradient-to-r from-[#FF9933] to-[#FF6B35] hover:brightness-110 text-white font-semibold px-6 mt-4 rounded-xl shadow-lg">
                        Select from computer
                    </Button>
                </div>
            )}

            {/* Step 2: Crop */}
            {step === 2 && rawImageSrc && (
                <div className="bg-[#0B0A1A] flex-1 flex items-center justify-center max-h-[60vh] overflow-hidden">
                    <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={1} className="max-h-full">
                        <img 
                          ref={currentImgRef} 
                          src={rawImageSrc} 
                          onLoad={onImageLoad} 
                          alt="To crop" 
                          className="max-h-[60vh] w-auto mx-auto pointer-events-none" 
                        />
                    </ReactCrop>
                </div>
            )}

            {/* Step 3: Caption Details */}
            {step === 3 && (
                <div className="flex flex-col md:flex-row h-full">
                    {/* Selected Image Preview */}
                    <div className="w-full md:w-1/2 bg-black flex items-center justify-center border-r border-[#2A2850]">
                        <img src={imagePreview} alt="Final Preview" className="w-full aspect-square object-cover" />
                    </div>
                    
                    {/* Caption area */}
                    <div className="w-full md:w-1/2 flex flex-col bg-[#16152a] text-[#EAEAF0]">
                        <div className="flex items-center gap-3 p-4 border-b border-[#2A2850]">
                            <Avatar className="w-8 h-8 ring-1 ring-[#FF9933]/50 p-[1px] bg-gradient-to-r from-[#FF9933] to-[#C850C0]">
                                <AvatarImage className="rounded-full" src={user?.profilePicture} alt="User Avatar" />
                                <AvatarFallback className="bg-[#0B0A1A] w-full h-full text-white text-xs flex items-center justify-center">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-[#FF9933]">{user?.username}</span>
                        </div>

                        {/* Caption textarea */}
                        <div className="flex-1 p-2 relative">
                            <Textarea 
                                value={caption} 
                                onChange={(e) => setCaption(e.target.value)} 
                                className="w-full min-h-[100px] resize-none border-none bg-transparent text-[#EAEAF0] placeholder:text-[#A1A1B5] focus-visible:ring-0 text-base" 
                                placeholder="Write a caption..." 
                            />
                            {/* AI Suggest Button */}
                            <button
                                onClick={handleSuggestCaption}
                                disabled={suggestingCaption}
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#C850C0] hover:text-[#ff79f0] transition-colors mt-1 ml-2 disabled:opacity-50"
                            >
                                {suggestingCaption
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Sparkles className="w-3.5 h-3.5" />
                                }
                                Suggest caption
                            </button>
                        </div>

                        {/* Mood Picker */}
                        <div className="px-3 pb-3 border-t border-[#2A2850] pt-3">
                            <p className="text-xs text-[#A1A1B5] font-semibold mb-2 uppercase tracking-wider">Post Mood</p>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map(m => (
                                    <button
                                        key={m.label}
                                        onClick={() => setSelectedMood(selectedMood === m.label ? '' : m.label)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                            selectedMood === m.label
                                                ? 'bg-[#FF9933]/20 border-[#FF9933] text-[#FF9933] shadow-[0_0_8px_rgba(255,153,51,0.3)]'
                                                : 'border-[#2A2850] text-[#A1A1B5] hover:border-[#FF9933]/50 hover:text-[#FF9933]'
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

        </div>

      </DialogContent>
    </Dialog>
  )
}

export default CreatePost
