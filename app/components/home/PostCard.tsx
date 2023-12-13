import React,{useEffect,useState} from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { FaHeart, FaRegComment,FaRegHeart } from 'react-icons/fa';
import { firestore, app } from '@/firebase';
import { collection, onSnapshot,addDoc, increment, query,where,doc,getDoc,getDocs,deleteDoc,updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import moment from 'moment';


interface Post {
    id: string;
    type: 'image' | 'video';
    mediaUrl: string;
    likes: number;
    comments: number;
    caption: string;
    userId: string;
    timestamp: any; // Update the type based on your data structure
    // Add other properties as needed
  }


  interface Like {
    id?: string;
    postId: string;
    userId: string;
  }

  interface User {
    id: string;
    userId: string;
    username: string;
    profilePic: string;
  }

interface Props {
    post:Post
    selectedPost?:Post
    setSelectedPost?: React.Dispatch<React.SetStateAction<any>>
    selectedUser?:User
    setSelectedUser?: React.Dispatch<React.SetStateAction<any>>
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

function PostCard({post,setOpen,selectedPost,selectedUser,setSelectedPost,setSelectedUser}:Props) {
    const auth = getAuth(app);
    const [postOwner, setPostOwner] = useState<any>(null);
    const [loggedInUserId, setLoggedInUserId] = useState<string>("");
    const [hasLiked, setHasLiked] = useState<boolean>(false);
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(firestore, 'users', post?.userId);
            const docSnap = await getDoc(docRef);
            const data = ({ id: docSnap.id, ...docSnap.data()});
            setPostOwner(data);
            setLoggedInUserId(user.uid);
          } else {
            setPostOwner(null);
            setLoggedInUserId("");
          }
        });
        return () => unsubscribe();
      }, [auth]);

      //check if loggen in user has liked the post
        useEffect(() => {
            if(!post?.id) return;
            if(!loggedInUserId) return;
            const likesQuery = query(
            collection(firestore, 'likes'),
            where('postId', '==', post?.id),
            where('userId', '==', loggedInUserId)
            );
            const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
            const hasLiked = !snapshot.empty;
            setHasLiked(hasLiked);
            });
            return () => unsubscribe();
        }, [post?.id,loggedInUserId]);

      

  //like post
  const like = async () => {
    if(!post?.id) return;
    
    const likesQuery = query(
      collection(firestore, 'likes'),
      where('postId', '==', post?.id),
      where('userId', '==', loggedInUserId)
    );
    // Check if the user has liked the post
    const likeSnapshot = await getDocs(likesQuery);
    const hasLiked = !likeSnapshot.empty;

    if (hasLiked) {
      // If the user has liked the post, delete the like
      const likeDoc = likeSnapshot.docs[0];
      await deleteDoc(doc(firestore, 'likes', likeDoc.id));
     
      await updateDoc(doc(firestore, 'posts',  post?.id), {
        likes: increment(-1),
      });
      toast.success('Post unliked successfully!');
    } else {
      // If the user hasn't liked the post, add a like
      const newLike: Like = {
        postId: post?.id || '',
        userId: loggedInUserId || '',
      };
  
      try {
        await addDoc(collection(firestore, 'likes'), newLike);
        await updateDoc(doc(firestore, 'posts',  post?.id), {
          likes:increment(1),
        });
       
        toast.success('Post liked successfully!');
      } catch (error) {
        console.error('Error liking post', error);
        toast.error('Error liking post');
      }
    }
  };

  const view = () => {
    if (setSelectedPost && setSelectedUser && post && postOwner && setOpen) {
      setSelectedPost(post);
      setSelectedUser(postOwner);
      setOpen(true);
    }
  };

  const convertTimestampToTimeAgo = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return 'Invalid Timestamp';
    }
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const duration = moment.duration(diffInMilliseconds);
    if (duration.asMinutes() < 60) {
      // Less than an hour, display minutes
      const minutes = Math.round(duration.asMinutes());
      return `${minutes}m`;
    } else if (duration.asHours() < 24) {
      // Less than a day, display hours
      const hours = Math.round(duration.asHours());
      return `${hours}h`;
    } else {
      // Display days
      const days = Math.round(duration.asDays());
      return `${days}d`;
    }
  };
  
        

  return (
    <div className='max-w-md mx-auto cursor-pointer'>
        <div className='flex items-center space-x-2'>
          <Avatar className='w-10 h-10 border-2 border-white'>
            <AvatarImage className='' src={postOwner?.profilePic} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1>{postOwner?.username}</h1>
          <p className='text-sm'>{convertTimestampToTimeAgo(post?.timestamp)}</p>
        </div>

        {/*image */}
        <div  className="relative hover:cursor-pointer h-80 lg:h-[480px] aspect-w-4 aspect-h-3 overflow-hidden group">
          {
             post?.type === "video" ? (
              <video src={post?.mediaUrl} className="object-cover h-full" autoPlay loop muted />
            ) : (
              <Image src={post?.mediaUrl} layout="fill" objectFit="cover" alt={`Post`} />
           )
          }
        </div>

        <div className='flex space-x-4 items-center mt-4'>
        {
            hasLiked ? (
                <FaHeart onClick={()=>{like()}} className="h-6 w-6 text-red-500 cursor-pointer"/>
            ) : (
                <FaRegHeart onClick={()=>{like()}} className="h-6 w-6 cursor-pointer"/>
            )
        }
        <FaRegComment onClick={()=>{view()}} className="h-6 w-6"/>
        </div>

        <div className='mt-2'>
            <p className='text-sm font-semibold'>{post?.likes} likes</p>
        </div>

        <div className='mt-2 flex space-x-2'>
            <p className='text-sm font-semibold'>{postOwner?.username}</p>
            <p className='text-sm'>{post?.caption}</p>
        </div>

        <div className='mt-2 border-b-2 border-gray-300 pb-4'>
            {
                post?.comments > 0 && (
                    <p onClick={()=>{view()}} className='text-sm text-gray-500'>View all {post?.comments} comments</p>
                )
            }
        </div>

    </div>
  )
}

export default PostCard