"use client"
import Sidebar from '@/app/components/common/Sidebar'
import React,{useState} from 'react'
import Status from '../components/home/Status'
import Posts from '../components/home/Posts'
import Suggested from '../components/home/Suggested'

function page() {
  const[reload,setReload] = useState<boolean>(false)
  return (
    <div className='flex flex-row'>
        {/* left sidebar */}
        <div className='w-2/12'>
            <Sidebar/>
        </div>

        {/* main content */}
        <div className='w-10/12 flex'>
          <div className='w-full lg:w-8/12'>
          <Status/>
           <Posts reload={reload} setReload={setReload}/>
          </div>

          <div className='w-0 hidden lg:block lg:w-4/12 '>
           {/*suggestions for who to follow*/}
           <Suggested reload={reload} setReload={setReload}/>
          </div>
           
        </div>
    </div>
  )
}

export default page