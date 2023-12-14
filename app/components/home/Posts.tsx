"use client"
import React,{useState,useEffect} from 'react'
import PostCard from './PostCard'
import { firestore, app } from '@/firebase';
import { collection, onSnapshot, orderBy, query,where,doc,getDoc ,getDocs} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ViewPost from './VewPost';
import {Dialog,DialogContent,DialogHeader} from "@/components/ui/dialog"

interface Post {
    id: string;
    type: 'image' | 'video';
    mediaUrl: string;
    caption: string;
    likes: number;
    comments: number;
    userId: string;
    timestamp: any; // Update the type based on your data structure
    // Add other properties as needed
  }

  interface Props {
    reload : boolean
    setReload : React.Dispatch<React.SetStateAction<boolean>>
  }

function Posts({reload,setReload}:Props) {
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post>();
  const [selectedUser, setSelectedUser] = useState<any>();
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reloadPosts, setReloadPosts] = useState<boolean>(false);

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
    if (!user) return;

    const currentUserId = user.userId;
    const currentUserDocRef = doc(firestore, 'users', currentUserId);
    const unsubscribe = onSnapshot(currentUserDocRef, (currentUserDocSnapshot) => {
      setLoading(true);

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

      const followingPostsQuery = query(
        collection(firestore, 'posts'),
        where('userId', 'in', followingUsers),
        orderBy('timestamp', 'desc')
      );

      const unsubscribePosts = onSnapshot(followingPostsQuery, (postsSnapshot) => {
        const postsData = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
        setFollowingPosts(postsData);
        setLoading(false);
        setReloadPosts(false);
      });

      return () => {
        // Cleanup logic for posts listener
        unsubscribePosts();
        setLoading(false);
      };
    });

    return () => {
      // Cleanup logic for user listener
      setLoading(false);
    };
  }, [user,reload]);

 
  console.log(followingPosts);

  
  return (
    <div className='max-w-3xl mx-auto p-4'>
        <div className='mt-4 space-y-4'>
            {
                loading ? (
                    <p>Loading...</p>
                ) : (
                  followingPosts?.map((post) => (
                        <PostCard key={post.id} post={post} selectedPost={selectedPost} setSelectedPost={setSelectedPost} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setOpen={setOpen} reloadPosts={reloadPosts} setReloadPosts={setReloadPosts}/>
                    ))
                )
            }
        </div>

          <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-w-4xl overflow-y-auto lg:max-w-7xl h-[80%] lg:h-[80%]'>
                    <DialogHeader className='bg-black'>
                     <ViewPost open={open} setOpen={setOpen} post={selectedPost} user={selectedUser}/>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

    
        
    </div>
  )
}

export default Posts