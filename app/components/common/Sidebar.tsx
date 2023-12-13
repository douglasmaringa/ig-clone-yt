"use client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Sidebar = () => {
    const pathname = usePathname()

  // Function to check if the given path is the current path
  const isCurrentPath = (path:string) => {
    return pathname.startsWith(path);
  };


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
                <Link className={`flex space-x-2 flex-row  items-center`} href="/search">
                {
                    isCurrentPath("/search") ?(<>
                    <LuSearchCheck className={`h-6 w-6`}/>
                    </>):(<>
                    <LuSearch className={`h-6 w-6`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Search</h1>
               </Link>
            </div>

            {/* Explore */}
            <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/explore">
                {
                    isCurrentPath("/explore") ?(<>
                    <MdExplore className={`h-6 w-6`}/>
                    </>):(<>
                    <MdOutlineExplore className={`h-6 w-6`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Explore</h1>
               </Link>
            </div>

            {/* Reels */}
            <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/reels">
                {
                    isCurrentPath("/reels") ?(<>
                    <BiSolidMoviePlay className={`h-6 w-6`}/>
                    </>):(<>
                    <BiMoviePlay className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Reels</h1>
               </Link>
            </div>

            {/* Messages */}
            <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/messages">
                {
                    isCurrentPath("/messages") ?(<>
                    <RiMessengerFill className={`h-6 w-6`}/>
                    </>):(<>
                    <RiMessengerLine className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Messages</h1>
               </Link>
            </div>

            {/*Notifications */}
            <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/notifications">
                {
                    isCurrentPath("/notifications") ?(<>
                    <FaHeart className={`h-6 w-6`}/>
                    </>):(<>
                    <FaRegHeart className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Notifications</h1>
               </Link>
            </div>

            {/*Create */}
            <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/create">
                {
                    isCurrentPath("/create") ?(<>
                    <SiAddthis className={`h-6 w-6`}/>
                    </>):(<>
                    <MdOutlineAddBox className={`h-6 w-6 rounded-md`}/>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Create</h1>
               </Link>
            </div>

             {/*Profile */}
             <div>
                <Link className={`flex space-x-2 flex-row  items-center`} href="/profile">
                {
                    isCurrentPath("/profile") ?(<>
                    <Avatar className='border-2 border-black h-6 w-6'>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    </>):(<>
                        <Avatar className=' h-6 w-6'>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </>)
                 }
                <h1 className="text-lg hidden lg:block">Profile</h1>
               </Link>
            </div>
            
            
          </div>  
    </aside>
  );
};

export default Sidebar;