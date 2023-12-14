import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function page() {
  const router = useRouter()
  return (
    <div className='flex items-center justify-center h-screen'>
      <Button onClick={()=>{router.push("/home")}}>Click me</Button>
    </div>
  )
}

export default page