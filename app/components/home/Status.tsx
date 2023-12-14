import React,{useState,useEffect} from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoMdAdd } from "react-icons/io";
import {Dialog,DialogContent,DialogHeader} from "@/components/ui/dialog"
import StatusCreate from './StatusCreate';
import { firestore, app } from '@/firebase';
import { collection, onSnapshot, orderBy, query,where,doc,getDoc ,getDocs} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';
import { useRouter } from 'next/navigation';


interface Post {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  userId: string;
  timestamp: any; // Update the type based on your data structure
  // Add other properties as needed
}

function Status() {
  const [open, setOpen] = useState<boolean>(false);
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [followingStatus, setFollowingStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const data = ({ id: docSnap.id, ...docSnap.data()});
        setUser(data);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchFollowingPosts = async () => {
      if (!user) return;
  
      const currentUserId = user.userId;
      setLoading(true);
  
      // Fetch the list of users the current user is following
      const currentUserDocRef = doc(firestore, 'users', currentUserId);
      const currentUserDocSnapshot = await getDoc(currentUserDocRef);
  
      if (!currentUserDocSnapshot.exists()) {
        setLoading(false);
        console.error('Current user document not found.');
        return;
      }
  
      const followingUsers = currentUserDocSnapshot.data()?.following || [];
  
      if (followingUsers.length === 0) {
        setLoading(false);
        // If the user is not following anyone, you can handle it accordingly
        return;
      }
  
        // Calculate the timestamp for the current moment
        const currentTimestamp = moment().toDate();

        // Calculate the timestamp for 24 hours ago
        const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();

        // Fetch posts from users the current user is following with timestamp greater than or equal to twentyFourHoursAgo and less than the current moment
        const followingStoryQuery = query(
          collection(firestore, 'story'),
          where('userId', 'in', followingUsers),
          where('timestamp', '>=', twentyFourHoursAgo),
          where('timestamp', '<=', currentTimestamp),
          orderBy('timestamp', 'desc')
        );
        
      const storySnapshot = await getDocs(followingStoryQuery);
  
      const postsData = storySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setFollowingStatus(postsData);
      setLoading(false);
    };
  
    fetchFollowingPosts();
  
    return () => {
      // Cleanup logic, if needed
      setLoading(false);
    };
  }, [user]);

  const handleOpen = () => {
    setOpen(true);
  }

  const view = (id:string) => {
    
    router.push(`/status/${id}`);
    
  }

  return (
    <div className='max-w-3xl mx-auto p-4 flex space-x-6 overflow-x-auto relative'>
      {/* statuses*/}
      <div className='flex flex-col items-center justify-center w-16'>
        <div onClick={()=>{handleOpen()}} className='flex items-center justify-center w-16 h-16 border-2 border-orange-600 rounded-full cursor-pointer hover:bg-gray-200'>
          <IoMdAdd className="h-8 w-8"/>
        </div>
        <p className='text-center text-xs line-clamp-1 mt-1'>Story</p>
      </div>

      {
        loading && (<>
        <div className='flex flex-col items-center justify-center w-16'>
        <div onClick={()=>{handleOpen()}} className='flex items-center justify-center w-16 h-16 border-2 border-orange-600 rounded-full cursor-pointer hover:bg-gray-200'>
          <IoMdAdd className="h-8 w-8"/>
        </div>
        <p className='text-center text-xs line-clamp-1 mt-1'>Loading</p>
      </div>
        </>)
      }

      {
        followingStatus?.map((status) => (
          <div onClick={()=>{view(status?.id)}} key={status?.id} className='flex flex-col items-center justify-center w-16'>
            <div className='w-16 h-16 border-2 border-orange-600 rounded-full cursor-pointer'>
              <Avatar className='w-full h-full border-2 border-white'>
                <AvatarImage className='' src={status?.mediaUrl} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <p className='text-center text-xs line-clamp-1 mt-1'>{status?.caption}</p>
          </div>
        ))
      }

      {/* Arrow indicating scrollability */}
      <div className='flex items-center absolute top-1/2 -translate-y-1/2 right-4 text-gray-500'>
        <div className='w-8 h-8 bg-gray-300 rounded-full'>
        <BiChevronRight className="h-8 w-8 text-white"/>
        </div>
      </div>

           <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className=''>
                    <DialogHeader className=''>
                     <StatusCreate open={open} setOpen={setOpen}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
    </div>
  );
}

export default Status;
