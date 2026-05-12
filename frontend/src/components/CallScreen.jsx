import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Peer from 'simple-peer';
import { acceptCall, endCall, initiateCall, setCallAccepted, resetCall } from '../redux/callSlice';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react';
import { getSocket } from '../socketConnection';

const CallScreen = () => {
    const { isReceivingCall, caller, callerSignal, isCalling, callAccepted, remoteUser } = useSelector(store => store.call);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [stream, setStream] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [hasEnded, setHasEnded] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        if (!isCalling && !isReceivingCall && !callAccepted) return;
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
        }).catch(err => console.log('Failed to get media permissions', err));

    }, [isCalling, isReceivingCall, callAccepted]);

    // Handle incoming call signaling logic
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        
        const handleCallAccepted = (signal) => {
            dispatch(setCallAccepted());
            if(connectionRef.current){
                connectionRef.current.signal(signal);
            }
        };

        const handleCallEnded = () => {
            leaveCall();
        };

        socket.on("callAccepted", handleCallAccepted);
        socket.on("callEnded", handleCallEnded);

        return () => {
            socket.off("callAccepted", handleCallAccepted);
            socket.off("callEnded", handleCallEnded);
        }
    }, [dispatch]);


    const callRemoteUser = () => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            getSocket().emit("callUser", {
                userToCall: remoteUser._id,
                signalData: data,
                from: user,
                name: user.username
            });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        getSocket().on("callAccepted", (signal) => {
            dispatch(setCallAccepted());
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    // Auto call when isCalling starts (initiator)
    useEffect(() => {
        if (isCalling && !callAccepted && stream) {
            callRemoteUser();
        }
    }, [isCalling, stream]);

    const answerCall = () => {
        dispatch(acceptCall());
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            getSocket().emit("answerCall", { signal: data, to: caller._id });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setHasEnded(true);
        if(connectionRef.current) {
            connectionRef.current.destroy();
        }
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        dispatch(endCall());
        setTimeout(()=> {
            dispatch(resetCall());
            setHasEnded(false);
        }, 1500);

        if(remoteUser || caller){
            getSocket().emit("endCall", { to: remoteUser?._id || caller?._id });
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    if (hasEnded) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
                <p className="text-xl">Call Ended</p>
            </div>
        );
    }

    if (!isCalling && !isReceivingCall && !callAccepted) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex flex-col items-center justify-center text-white p-4">
            
            {/* INCOMING CALL SCREEN */}
            {isReceivingCall && !callAccepted && (
                <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
                    <Avatar className="w-32 h-32 border-4 border-white">
                        <AvatarImage src={caller?.profilePicture} />
                        <AvatarFallback>{caller?.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold font-outfit">{caller?.username}</h2>
                        <p className="text-gray-400 mt-2">is calling you with video...</p>
                    </div>
                    <div className="flex gap-10 mt-8">
                        <button onClick={leaveCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-transform">
                            <PhoneOff className="w-8 h-8" />
                        </button>
                        <button onClick={answerCall} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-transform animate-bounce">
                            <Phone className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVE CALL OR CALLING SCREEN */}
            {(callAccepted || isCalling) && (
                <div className="w-full h-full relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                    
                    {/* Ringing text if calling */}
                    {isCalling && !callAccepted && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={remoteUser?.profilePicture} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <p className="text-xl font-bold">Calling {remoteUser?.username}...</p>
                        </div>
                    )}

                    {/* Remote Video */}
                    <div className="w-full h-full absolute inset-0">
                        {callAccepted ? (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        ) : null}
                    </div>

                    {/* Local Video Picture-in-Picture */}
                    {stream && (
                        <div className="absolute top-4 right-4 w-32 h-48 md:w-48 md:h-64 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-20">
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="absolute bottom-6 flex gap-6 bg-black/50 px-8 py-4 rounded-full backdrop-blur-md z-30">
                        <button onClick={toggleMic} className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white text-black'}`}>
                            {isMicOn ? <Mic /> : <MicOff />}
                        </button>
                        <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white text-black'}`}>
                            {isVideoOn ? <Video /> : <VideoOff />}
                        </button>
                        <button onClick={leaveCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
                            <PhoneOff />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallScreen;
