'use client';
import React from 'react';
import  { useState,useEffect } from 'react';
import {auth,firestore} from "../../firebase"
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';



function Signup() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();


  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errorCounter = 0;
  
    if (!name.trim()) {
      toast.error('Name is required');
      errorCounter++;
    }
    if (!username.trim()) {
      toast.error('Username is required');
      errorCounter++;
    }
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
        const userCredential = await createUserWithEmailAndPassword(auth,email, password);
        const user = userCredential.user;

         // Now you can use the user's UID as the document ID
         const docRef = doc(firestore, 'users', user.uid);
         await setDoc(docRef, {
           userId:user.uid,
           name,
           email,
           username,
           bio:"",
           profilePic:"",
           followers:[],
           following:[],
         });
         
         toast.success('Account created successfully!');
          // Redirect user to dashboard
          router.push('/home') 
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
    <div className='mx-auto max-w-sm'>
      
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
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              name="name"
            />
           
            <Input
              className='w-full'
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              name="username"
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
              {loading ? 'Loading...' : 'Sign Up'}
            </Button>
           </form>
          </div>
            {/* Additional content for the right side */}
          <div className='border border-gray-500 mt-8'>
             <div className='flex items-center justify-center p-6'>
              <p className='text-sm'>Have An Account? <Link className='text-[#67b5fa]' href='/signin'>Sign-in</Link></p>
              </div>
          </div>
        </div>
    </div>
  );
}

export default Signup;
