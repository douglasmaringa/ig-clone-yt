import React,{FormEvent,useEffect,useState} from 'react';
import { FaTrash,FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { where,onSnapshot,query,orderBy,addDoc,collection,serverTimestamp,getDocs,deleteDoc,doc,updateDoc,increment,getDoc} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { firestore,app } from '@/firebase';
import moment from 'moment';

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
  caption: string;
  userId: string;
  timestamp: any; 
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
  const [likes, setLikes] = useState<number>(post?.likes || 0);
  const [userDb, setUser] = useState<string>("");
  const auth = getAuth(app);

  const convertTimestampToTimeAgo = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return 'Invalid Timestamp';
    }
    const date = timestamp.toDate(); 
    const now = new Date(); 
    const diffInMilliseconds = now.getTime() - date.getTime();
    return moment.duration(diffInMilliseconds).humanize();
  };

  //get logged in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user?.uid);
      } else {
        setUser("");
      }
    });
    return () => unsubscribe();
  }, [auth]);
  
  //get comments
  useEffect(() => {
    if(!post?.id) return;
    const tasksQuery = query(collection(firestore, 'comments'),where('postId', '==',post?.id ),orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
      setCommentsDb(commentsData);
    });
    return () => unsubscribe();
  }, [post?.id]);


  //get if you have liked likes
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

  //get like count
  useEffect(() => {
    if(!post?.id) return;
    const likesQuery = query(
      collection(firestore, 'likes'),
      where('postId', '==', post?.id)
    );
    const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
      const likesCount = snapshot.size;
      setLikes(likesCount);
    });
    return () => unsubscribe();
  }, [post?.id,user?.userId]);

  //submit comment
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if(!comments) return;
    if(!post?.id) return;

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
        await updateDoc(doc(firestore, 'posts',  post?.id), {
          comments: increment(1),
        });
        toast.success('comment posted successfully!');
        setComments('');
    } catch (error) {
      console.error('Error posting comment', error);
      toast.error('Error posting comment');
      setComments('');
    }
  };

  //like post
  const like = async () => {
    if(!post?.id) return;
    
    const likesQuery = query(
      collection(firestore, 'likes'),
      where('postId', '==', post?.id),
      where('userId', '==', user?.userId)
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
        userId: user?.userId || '',
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

  const removePost = async () => {
    const postId = post?.id || '';
    try {
      await deleteDoc(doc(firestore, 'posts', postId));
      toast.success('Post deleted successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error deleting post', error);
      toast.error('Error deleting post');
    }
  }

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
        <div className=''>
          <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-4">
            <div className="flex items-center justify-between space-x-2">
            <div className='w-1/3'>
              <Avatar className='w-10 h-10'>
                <AvatarImage src={user?.profilePic} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <br/>
              <p className="text-sm font-semibold">{user?.username}</p>
            </div>
            <div className="flex items-center space-x-2">
              {
                userDb === post?.userId && (
                  <FaTrash onClick={()=>{removePost()}} className="text-red-500 hover:cursor-pointer hover:text-red-800" />
                )
              }
            
            </div>
          </div>

          {/* Comments */}
          <div className="overflow-auto max-h-40 xl:max-h-96">
               <div className="flex items-center space-x-2 mb-2">
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={user?.profilePic} />
                    <AvatarFallback>CN.</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold">{user?.username}</p>
                  <p className="text-sm">{post?.caption}</p>
                </div>
            {
              commentsDb.map((comment) => (
                <div key={comment.id} className="flex items-center space-x-2 mb-2">
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={comment?.profilePic} />
                    <AvatarFallback>CN.</AvatarFallback>
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
          <p className="text-sm font-semibold">{likes} Likes</p>
          <p className="text-xs ">{convertTimestampToTimeAgo(post?.timestamp)} ago</p>
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
