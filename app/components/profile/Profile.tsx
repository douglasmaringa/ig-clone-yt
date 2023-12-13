import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MdOutlineGridOn } from "react-icons/md";
import Image from 'next/image';
import { FaHeart, FaComment } from 'react-icons/fa';

function Profile() {
  const imageUrls = ['/1.jpg', '/2.jpg', '/1.jpg', '/2.jpg', '/1.jpg', '/2.jpg'];

  return (
    <div className='max-w-4xl mx-auto p-10'>
      {/* profile header */}
       <div className='flex flex-col lg:flex-row'>

          <div className='w-1/3'>
          <Avatar className='w-40 h-40'>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          </div>

          <div className='w-2/3 space-y-4'>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-xl '>CodingDouglas</h1>
                  <Button className='font-semibold' variant="secondary">Edit Profile</Button>
              </div>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-base'><span className='font-bold mr-1'>2</span>Posts</h1>
                  <h1 className='text-base'><span className='font-bold mr-1'>122k</span>Followers</h1>
                  <h1 className='text-base'><span className='font-bold mr-1'>20</span>Following</h1>
              </div>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-base font-semibold'>Coding with Douglas</h1>
              </div>
              <div className='flex space-x-4 items-center'>
                  <p className='truncate'>profile bio</p>
              </div>
          </div>

       </div>

       {/* profile posts header */}
       <div className='border-t border-gray-200 mt-10'>
          <div className='flex pt-2 items-center justify-center mx-auto w-20 border-t-2 border-black'>
            <MdOutlineGridOn className="w-4 h-4"/>
            <h1 className='text-center text-base'>Posts</h1>
          </div>
       </div>

       {/* posts */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
       {imageUrls.map((url, index) => (
        <div key={index} className="relative hover:cursor-pointer h-72 aspect-w-4 aspect-h-3 overflow-hidden group">
          <Image src={url} layout="fill" objectFit="cover" alt={`Post ${index + 1}`} />

          <div className="hidden group-hover:flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 transition duration-300">
            <div className="text-white text-center flex items-center">
              <FaHeart className="mx-1" />
               1.2k
               <FaComment className="mx-1 ml-4" />
               1.2k
            </div>
          </div>
        </div>
      ))}
    </div>

    </div>
  )
}

export default Profile