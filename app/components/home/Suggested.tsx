"use client"
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, doc, updateDoc,arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app, firestore } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {toast} from 'react-hot-toast';

interface User {
  id: string;
  userId: string;
  username: string;
  profilePic: string;
  followers?: string[];
  following?: string[];
}

interface Props {
    reload : boolean
    setReload : React.Dispatch<React.SetStateAction<boolean>>
  }

function Suggested({reload,setReload}:Props) {
  const auth = getAuth(app);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [reload2, setReload2] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!auth.currentUser) return;

      const currentUserId = auth.currentUser.uid;

      // Fetch 10 users whose userId is not in the current user's following list
      const usersQuery = query(
        collection(firestore, 'users'),
        where('userId', '!=', currentUserId),
        limit(10)
      );

      const usersSnapshot = await getDocs(usersQuery);

      const usersData = usersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as User))
        .filter((user) => !user.followers?.includes(currentUserId)); // Adjust this based on your actual data structure

      setSuggestedUsers(usersData);
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchSuggestedUsers();
      }
    });

    return () => {
      // Cleanup logic, if needed
    };
  }, [auth,reload2]);

  // Follow a user
  const followUser = async (userId:string) => {
    if (!userId || !auth.currentUser) return;
  
    const currentUserId = auth.currentUser.uid;
   
  
    // Update the current user's following list
    const currentUserDocRef = doc(firestore, 'users', currentUserId);
    await updateDoc(currentUserDocRef, {
      following: arrayUnion(userId),
    });
  
    // Update the followed user's followers list
    const followedUserDocRef = doc(firestore, 'users', userId);
    await updateDoc(followedUserDocRef, {
      followers: arrayUnion(currentUserId),
    });

    toast.success('User followed successfully!');
  
    // Trigger a reload of data
    setReload2((prev) => !prev);
    setReload((prev) => !prev);
  };


  
  return (
    <div className='max-w-xs mx-auto p-10'>
      <h2 className='text-sm'>Suggested for you</h2>
      {suggestedUsers.map((user) => (
        <div className='mt-4 flex justify-between items-center space-x-4' key={user.id}>
          <div className='flex items-center space-x-2'>
            <Avatar className='w-10 h-10 border-2 border-white'>
              <AvatarImage className='' src={user?.profilePic} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className='cursor-pointer text-sm font-semibold'>{user?.username}</h1>
          </div>
          <button onClick={() => followUser(user.userId)} className='text-blue-500 text-sm'>
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}

export default Suggested;
