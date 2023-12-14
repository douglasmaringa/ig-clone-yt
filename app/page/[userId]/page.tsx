import Sidebar from '@/app/components/common/Sidebar'
import React from 'react'
import Single from '@/app/components/single/Single'

interface Props {
    params: {
      userId: string;
    }
  }

function page({params}: Props) {
  const {userId} = params;
  return (
    <div className='flex flex-row'>
        {/* left sidebar */}
        <div className='w-2/12'>
            <Sidebar/>
        </div>

        {/* main content */}
        <div className='w-10/12'>
            <Single userId={userId}/>
        </div>
    </div>
  )
}

export default page