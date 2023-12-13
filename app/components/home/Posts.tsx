"use client"
import React,{useState,useEffect} from 'react'
import PostCard from './PostCard'
import { firestore, app } from '@/firebase';
import { collection, onSnapshot, orderBy, query,where,doc,getDoc } from 'firebase/firestore';
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

function Posts() {
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post>();
  const [selectedUser, setSelectedUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

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
    setLoading(true);
    setLoading(true);
    const postsQuery = query(collection(firestore, 'posts'),orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(tasksData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //console.log(selectedPost,selectedUser)

  return (
    <div className='max-w-3xl mx-auto p-4'>
        <div className='mt-4 space-y-4'>
            {
                loading ? (
                    <p>Loading...</p>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} selectedPost={selectedPost} setSelectedPost={setSelectedPost} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setOpen={setOpen}/>
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