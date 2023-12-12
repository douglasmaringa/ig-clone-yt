'use client';
import React from 'react';
import  { useState } from 'react';
import {auth} from "../../firebase"
import {signInWithEmailAndPassword } from 'firebase/auth';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function Signin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();


  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errorCounter = 0;
  
    if (!email.trim() || !emailRegex.test(email)) {
     toast.error('Please enter a valid email address');
     errorCounter++;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      errorCounter++;
    }
    return errorCounter === 0;
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setLoading(true);
    
    try {
      if (validateForm()) {
        // Register user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth,email, password);
        const user = userCredential.user;
        if(user){
         toast.success('Logged in successfully!');
         // Redirect user to dashboard
         router.push('/home') 
        }
          
      }else{
        toast.error('fill all fields');
      }
    } catch (error) {
      // Handle registration errors
      console.error('Error registering user:', error);
      toast.error(`${error}`);
    }
    setLoading(false);
  };

  return (
    <div className='flex h-screen justify-center items-center'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 h-[90%]'>
        {/* Left */}
        <div className='hidden lg:flex items-center justify-center'>
          <div className='h-[90%] w-96 relative'>
            <Image src='/phone.png' layout='fill' objectFit='contain' alt="phone" />
          </div>
        </div>

        {/* Right */}
        <div className='lg:px-4 my-auto'>
          <div className='border border-gray-500 mt-10'>
            <Image className='mx-auto p-8' src='/logo.png' width={170} height={80} alt="logo" />
            <form className='px-6 mb-6 space-y-4' onSubmit={handleSubmit}>
            <Input
              className='w-full'
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              name="email"
            />
            <Input
              className='w-full'
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              name="password"
            />
            <Button disabled={loading} className='w-full rounded-lg bg-[#67b5fa]'>
              {loading ? 'Loading...' : 'Sign in'}
            </Button>

            <div>
              <p className='text-center'>OR</p>
              <div className='flex items-center justify-center mt-4'>
              <Link className='text-sm' href='/signup'>Forgotten Your Password?</Link>
              </div>
            </div>

            </form>
          </div>
          {/* Additional content for the right side */}
          <div className='border border-gray-500 mt-8'>
             <div className='flex items-center justify-center p-6'>
              <p className='text-sm'>Don't have An Account? <Link className='text-[#67b5fa]' href='/signup'>Sign-up</Link></p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
