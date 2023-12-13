import Sidebar from '@/app/components/common/Sidebar'
import React from 'react'

function page() {
  return (
    <div className='flex flex-row'>
        {/* left sidebar */}
        <div className='w-2/12'>
            <Sidebar/>
        </div>

        {/* main content */}
        <div className='w-10/12 bg-[#07223aff]'>
            home
        </div>
    </div>
  )
}

export default page