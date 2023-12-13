import React,{FormEvent,useEffect,useState} from 'react';
import { FaTrash,FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { where,onSnapshot,query,orderBy,addDoc,collection,serverTimestamp,getDocs,deleteDoc,doc,updateDoc,FieldValue,increment,setDoc} from "firebase/firestore";
import { toast } from 'react-hot-toast';
import { firestore } from '@/firebase';

interface Comment {
  id?: string;
  postId: string;
  userId: string;
  username?: string;
  profilePic?: string;
  timestamp: any; // Replace with the actual type for your timestamp
  text: string;
}

interface Like {
  id?: string;
  postId: string;
  userId: string;
}

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

interface User {
  id: string;
  userId: string;
  username: string;
  profilePic: string;
}

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  post: Post | undefined;
  user: User | undefined;
}

function ViewPost({ open, setOpen, post,user }: Props) {
  const[comments,setComments] = React.useState<string>("")
  const [commentsDb, setCommentsDb] = useState<Comment[]>([]);
  const [hasLiked, setHasLiked] = useState<boolean>(false);

  useEffect(() => {
    if(!post?.id) return;
  
    const tasksQuery = query(collection(firestore, 'comments'),where('postId', '==',post?.id ),orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      setCommentsDb(commentsData);
    });
    return () => unsubscribe();
  }, [post?.id]);

  useEffect(() => {
    if(!post?.id) return;
  
    const likesQuery = query(
      collection(firestore, 'likes'),
      where('postId', '==', post?.id),
      where('userId', '==', user?.userId)
    );
  
    const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
      const hasLiked = !snapshot.empty;
      setHasLiked(hasLiked);
    });
    return () => unsubscribe();
  }, [post?.id,user?.userId]);

 
  

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if(!comments) return;

    const comment: Comment = {
      postId: post?.id || '',
      userId: user?.userId || '',
      username: user?.username || '',
      profilePic: user?.profilePic || '',
      timestamp: serverTimestamp(),
      text: comments,
    };

    try {
        const docRef = await addDoc(collection(firestore, 'comments'), comment);
        toast.success('comment posted successfully!');
        setComments('');
    } catch (error) {
      console.error('Error posting comment', error);
      toast.error('Error posting comment');
      setComments('');
    }
  };


  const like = async () => {
  
    const likesQuery = query(
      collection(firestore, 'likes'),
      where('postId', '==', post?.id),
      where('userId', '==', user?.userId)
    );
  
    // Check if the user has liked the post
    const likeSnapshot = await getDocs(likesQuery);
    const hasLiked = !likeSnapshot.empty;
    const userId: string = user?.id || '';
     
    console.log(userId)
    if (hasLiked) {
      // If the user has liked the post, delete the like
      const likeDoc = likeSnapshot.docs[0];
      await deleteDoc(doc(firestore, 'likes', likeDoc.id));
      await updateDoc(doc(firestore, 'users',  userId), {
        likes: increment(-1),
      });
      toast.success('Post unliked successfully!');
    } else {
      // If the user hasn't liked the post, add a like
      const newLike: Like = {
        postId: post?.id || '',
        userId: user?.userId || '',
      };
  
      try {
        await addDoc(collection(firestore, 'likes'), newLike);
        await updateDoc(doc(firestore, 'users',  userId), {
          likes:increment(1),
        });
        toast.success('Post liked successfully!');
      } catch (error) {
        console.error('Error liking post', error);
        toast.error('Error liking post');
      }
    }
  };

  return (
    <div className="lg:flex items-stretch h-full">
      {/* Post media (50% width) */}
      <div className="w-2/2 lg:w-1/2 flex bg-black items-center justify-center overflow-hidden flex-1">
        {post?.type === 'video' ? (
          <video
            src={post?.mediaUrl}
            className="object-cover w-full h-full"
            controls
          />
        ) : (
          <img
            src={post?.mediaUrl}
            alt="Post"
            className="object-cover w-full h-full"
          />
        )}
      </div>

      {/* Right section (50% width) */}
      <div className="w-2/2 lg:w-1/2 p-4 flex flex-col justify-between bg-white text-black">
        {/* Post details */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
            <div className='w-1/3'>
              <Avatar className='w-10 h-10'>
                <AvatarImage src={user?.profilePic} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
              <p className="text-sm font-semibold">{user?.username}</p>
            </div>
            <div className="flex items-center space-x-2">
            <FaTrash  className="text-red-500 hover:cursor-pointer hover:text-red-800" />
            </div>
          </div>

          {/* Comments */}
          <div className="overflow-auto max-h-40 xl:max-h-96">
            {
              commentsDb.map((comment) => (
                <div key={comment.id} className="flex items-center space-x-2 mb-2">
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={comment?.profilePic} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold">{comment?.username}</p>
                  <p className="text-sm">{comment?.text}</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* Add Comment */}
        <div className="border-t border-gray-200 pt-2">
          <div className='flex items-center'>
            {
              hasLiked ? (
                <FaHeart onClick={()=>{like()}} className="h-8 w-8 text-red-600 hover:cursor-pointer" />
              ) : (
                <CiHeart onClick={()=>{like()}} className="h-8 w-8 hover:cursor-pointer" />
              )
            }
         
          </div>
          <div className='flex flex-col'>
          <p className="text-sm font-semibold">206 Likes</p>
          <p className="text-xs ">1 hour ago</p>
          </div>
          <form onSubmit={submit} className='flex items-center space-x-2 mt-4'>
          <input
            type="text"
            placeholder="Add a comment..."
            className="border border-gray-300 p-2 flex-1 rounded bg-white text-black"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </form>
        </div>


      </div>
    </div>
  );
}

export default ViewPost;
