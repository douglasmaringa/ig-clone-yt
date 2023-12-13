import React from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Status() {
  return (
    <div className='max-w-3xl mx-auto p-4 flex space-x-6 overflow-x-auto relative'>
      {/* statuses*/}
      <div className='flex flex-col items-center justify-center w-16'>
        <div className='w-16 h-16 border-2 border-orange-600 rounded-full cursor-pointer'>
          <Avatar className='w-full h-full border-2 border-white'>
            <AvatarImage className='' src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <p className='text-center text-xs line-clamp-1 mt-1'>Good Morty</p>
      </div>

      <div className='flex flex-col items-center justify-center w-16'>
        <div className='w-16 h-16 border-2 border-orange-600 rounded-full cursor-pointer'>
          <Avatar className='w-full h-full border-2 border-white'>
            <AvatarImage className='' src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <p className='text-center text-xs line-clamp-1 mt-1'>Evil Morty hello</p>
      </div>

      {/* Arrow indicating scrollability */}
      <div className='flex items-center absolute top-1/2 -translate-y-1/2 right-4 text-gray-500'>
        <div className='w-8 h-8 bg-gray-300 rounded-full'>
        <BiChevronRight className="h-8 w-8 text-white"/>
        </div>
      </div>
    </div>
  );
}

export default Status;
