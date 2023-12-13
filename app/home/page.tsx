import Sidebar from '@/app/components/common/Sidebar'
import React from 'react'
import Status from '../components/home/Status'
import Posts from '../components/home/Posts'

function page() {
  return (
    <div className='flex flex-row'>
        {/* left sidebar */}
        <div className='w-2/12'>
            <Sidebar/>
        </div>

        {/* main content */}
        <div className='w-10/12 flex'>
          <div className='w-full lg:w-9/12'>
          <Status/>
           <Posts/>
          </div>

          <div className='w-0 hidden lg:block lg:w-3/12 '>
           {/*suggestions*/}
          </div>
           
        </div>
    </div>
  )
}

export default page