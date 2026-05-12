import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import logo from '../assets/project icon.png';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:3000/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div className='flex items-center w-screen h-screen justify-center bg-[#0B0A14]'>
            <form onSubmit={signupHandler} className='shadow-depth flex flex-col gap-5 p-8 bg-[#16152A] rounded-2xl border border-[#2A2850] w-full max-w-md mx-4'>
                <div className='my-4 flex flex-col items-center'>
                    <img src={logo} alt="Project Logo" className='w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(255,153,51,0.5)]' />
                    <h1 className='text-center font-bold text-2xl text-[#EAEAF0]'>Join Us</h1>
                    <p className='text-sm text-center text-[#A1A1B5] mt-2'>Signup to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium text-[#EAEAF0]'>Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-[#0B0A14] border-[#2A2850] text-[#EAEAF0] rounded-xl"
                    />
                </div>
                <div>
                    <span className='font-medium text-[#EAEAF0]'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-[#0B0A14] border-[#2A2850] text-[#EAEAF0] rounded-xl"
                    />
                </div>
                <div>
                    <span className='font-medium text-[#EAEAF0]'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 bg-[#0B0A14] border-[#2A2850] text-[#EAEAF0] rounded-xl"
                    />
                </div>
                {
                    loading ? (
                        <Button className="bg-gradient-primary hover:brightness-110 shadow-glow rounded-xl font-bold h-11">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit' className="bg-gradient-primary hover:brightness-110 shadow-glow hover:scale-105 transition-all outline-none rounded-xl font-bold h-11 text-white">Signup</Button>
                    )
                }
                <span className='text-center text-[#A1A1B5]'>Already have an account? <Link to="/login" className='text-[#FF9933] hover:text-[#EAEAF0] font-bold transition-colors'>Login</Link></span>
            </form>
        </div>
    )
}

export default Signup