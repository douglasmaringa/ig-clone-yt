"use client"
import React,{useState,useEffect} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MdOutlineGridOn } from "react-icons/md";
import Image from 'next/image';
import { FaHeart, FaComment } from 'react-icons/fa';
import { firestore, app } from '@/firebase';
import { collection, onSnapshot, orderBy, query,where,doc,getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {Dialog,DialogContent,DialogHeader} from "@/components/ui/dialog"
import ViewPost from '../common/ViewPost';
import EditProfile from '../common/EditProfile';

interface Post {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  likes: number;
  comments: number;
  userId: string;
  timestamp: any; // Update the type based on your data structure
  // Add other properties as needed
}



function Profile() {
  const imageUrls = ['/1.jpg', '/2.jpg', '/2.jpg', '/2.jpg', '/1.jpg', '/2.jpg'];
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post>();
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const data = ({ id: docSnap.id, ...docSnap.data()});
        setUser(data);
      } else {
        setUser(null);
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [auth,reload]);

  //console.log(user)

  useEffect(() => {
    setLoading(true);
    if(!user?.username){
      setLoading(false);
      return;
    }
    setLoading(true);
    const postsQuery = query(collection(firestore, 'posts'),where('userId', '==', user?.userId),orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [user?.username]);

  const view = (post:Post) => {
    setPost(post)
    setOpen(true)
  }

  const edit = () => {
    setOpen2(true)
  }


  return (
    <div className='max-w-4xl mx-auto p-10'>
      {/* profile header */}
       <div className='flex flex-col lg:flex-row'>

          <div className='w-1/3'>
          <Avatar className='w-40 h-40'>
            <AvatarImage src={user?.profilePic} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          </div>

          <div className='w-2/3 space-y-4'>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-xl'>{user?.username}</h1>
                  <Button onClick={edit} className='font-semibold' variant="secondary">Edit Profile</Button>
              </div>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-base'><span className='font-bold mr-1'>{posts?.length}</span>Posts</h1>
                  <h1 className='text-base'><span className='font-bold mr-1'>{user?.followers?.length}</span>Followers</h1>
                  <h1 className='text-base'><span className='font-bold mr-1'>{user?.following?.length}</span>Following</h1>
              </div>
              <div className='flex space-x-4 items-center'>
                  <h1 className='text-base font-semibold'>{user?.name}</h1>
              </div>
              <div className='flex space-x-4 items-center'>
                  <p className='truncate'>{user?.bio}</p>
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

       {
          loading && (
            <div className='flex items-center justify-center mt-10'>
              <p className='text-xl'>Loading...</p>
            </div>
          )
       }


       {/* posts */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
       {posts?.map((post, index) => (
        <div onClick={()=>{view(post)}} key={index} className="relative hover:cursor-pointer h-72 aspect-w-4 aspect-h-3 overflow-hidden group">
          {
            post?.type === "video" ? (
              <video src={post?.mediaUrl} className="object-cover h-full" autoPlay loop muted />
            ) : (
              <Image src={post?.mediaUrl} layout="fill" objectFit="cover" alt={`Post ${index + 1}`} />
           )
          }
          
          <div className="hidden group-hover:flex items-center justify-center absolute inset-0 bg-black bg-opacity-50 transition duration-300">
            <div className="text-white text-center flex items-center">
              <FaHeart className="mx-1" />
               {post?.likes}
               <FaComment className="mx-1 ml-4" />
               {post?.comments}
            </div>
          </div>
        </div>
      ))}
    </div>

           <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-w-4xl overflow-y-auto lg:max-w-7xl h-[80%] lg:h-[80%]'>
                    <DialogHeader className='bg-black'>
                     <ViewPost open={open} setOpen={setOpen} post={post} user={user}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={open2} onOpenChange={setOpen2}>
                <DialogContent className=''>
                    <DialogHeader className=''>
                     <EditProfile open={open2} setOpen={setOpen2} user={user} reload={reload} setReload={setReload}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

    </div>
  )
}

export default Profile