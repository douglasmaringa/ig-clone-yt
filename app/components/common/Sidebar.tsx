"use client";
import { useState,useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { GoHome,GoHomeFill } from "react-icons/go";
import { LuSearch,LuSearchCheck} from "react-icons/lu";
import { MdOutlineExplore,MdExplore,MdOutlineAddBox } from "react-icons/md";
import { BiMoviePlay,BiSolidMoviePlay } from "react-icons/bi";
import { RiMessengerLine,RiMessengerFill } from "react-icons/ri";
import { FaRegHeart,FaHeart } from "react-icons/fa";
import { SiAddthis } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {Dialog,DialogContent,DialogHeader,DialogTitle} from "@/components/ui/dialog"
import { doc,getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore, app } from '@/firebase';
import CreatePost from './CreatePost';
import { toast } from 'react-hot-toast';
  

const Sidebar = () => {
    const [open, setOpen] = useState<boolean>(false);
    const auth = getAuth(app);
    const [loggedInUser, setLoggedInUser] = useState<any>([]);
    const pathname = usePathname()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            const data = ({ id: docSnap.id, ...docSnap.data()});
            setLoggedInUser(data);
          } else {
            setLoggedInUser([]);
          }
        });
        return () => unsubscribe();
      }, [auth]);

  // Function to check if the given path is the current path
  const isCurrentPath = (path:string) => {
    return pathname.startsWith(path);
  };

  const create = () => {
    setOpen(true)
  }


  return (
    <aside className="fixed shadow-lg top-0 left-0 z-40 h-screen font-primary w-2/12">
    
         <Image className='p-6 hidden lg:block' src='/logo.png' width={170} height={80} alt="logo" />
        
          <div className="px-6 mt-4 bg-white h-[100%] space-y-6 overflow-auto">
            {/* Dashboard */}
            <div className=''>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/home">
                {
                    isCurrentPath("/home") ?(<>
                    <GoHomeFill className={`h-6 w-6`}/>
                    </>):(<>
                    <GoHome className={`h-6 w-6`}/>
                    </>)
                }
                <h1 className="text-lg hidden lg:block">Home</h1>
               </Link>
            </div>

            {/* Search */}
            <div>
                <button onClick={()=>{toast.success("search coming in future")}} className={`flex space-x-2 flex-row  items-center`}>
                {
                    isCurrentPath("/search") ?(<>
                    <LuSearchCheck className={`h-6 w-6`}/>
                    </>):(<>
                    <LuSearch className={`h-6 w-6`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Search</h1>
               </button>
            </div>

            

            {/* Messages */}
            <div>
                <button onClick={()=>{toast.success("messages coming in future")}} className={`flex space-x-2 flex-row  items-center`}>
                {
                    isCurrentPath("/messages") ?(<>
                    <RiMessengerFill className={`h-6 w-6`}/>
                    </>):(<>
                    <RiMessengerLine className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Messages</h1>
               </button>
            </div>

            {/*Notifications */}
            <div>
                <button onClick={()=>{toast.success("notifications coming in future")}} className={`flex space-x-2 flex-row  items-center`}>
                {
                    isCurrentPath("/notifications") ?(<>
                    <FaHeart className={`h-6 w-6`}/>
                    </>):(<>
                    <FaRegHeart className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Notifications</h1>
               </button>
            </div>

            {/*Create */}
            <div>
                <button onClick={create} className={`flex space-x-2 flex-row  items-center`}>
                {
                    isCurrentPath("/create") ?(<>
                    <SiAddthis className={`h-6 w-6`}/>
                    </>):(<>
                    <MdOutlineAddBox className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Create</h1>
               </button>
            </div>

             {/*Profile */}
             <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/profile">
                {
                    isCurrentPath("/profile") ?(<>
                    <Avatar className='border-2 border-black h-6 w-6'>
                        <AvatarImage src={loggedInUser?.profilePic} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    </>):(<>
                        <Avatar className=' h-6 w-6'>
                        <AvatarImage src={loggedInUser?.profilePic} />
                        <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Profile</h1>
               </Link>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle className='text-center'>Create New Post</DialogTitle>
                     <CreatePost open={open} setOpen={setOpen}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

          </div>  
    </aside>
  );
};

export default Sidebar;