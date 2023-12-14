"use client"
import React, { useEffect, useState } from 'react';
import Stories, { WithHeader } from 'react-insta-stories';
import { firestore, app } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { IoMdClose } from 'react-icons/io';

interface Story {
  id: string;
  userId: string; // Add userId to Story
  url: string;
  type?: 'image' | 'video';
  duration?: number;
  preloadResource?: boolean;
  user?: {
    username: string;
    profilePic: string;
  };
}

interface Props {
  params: {
    id: string;
  };
}

function Page({ params }: Props) {
  const { id } = params;
  const auth = getAuth(app);
  const [user, setUser] = useState<any>(null);
  const [followingStatus, setFollowingStatus] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Get the current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const data = { id: docSnap.id, ...docSnap.data() };
        setUser(data);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch statuses of people I follow
  useEffect(() => {
    const fetchFollowingStories = async () => {
      if (!user) return;
      const currentUserId = user.userId;
      setLoading(true);

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
        return;
      }

      const currentTimestamp = moment().toDate();
      const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();

      const followingStoryQuery = query(
        collection(firestore, 'story'),
        where('userId', 'in', followingUsers),
        where('timestamp', '>=', twentyFourHoursAgo),
        where('timestamp', '<=', currentTimestamp),
      );

      const storySnapshot = await getDocs(followingStoryQuery);

      const storiesData = await Promise.all(
        storySnapshot.docs.map(async (docSnap) => {
          // Fetch user details for each post
          const userDocRef = doc(firestore, 'users', docSnap.data().userId);
          const userDocSnapshot = await getDoc(userDocRef);
          const userData = userDocSnapshot.data();
          
          return {
            id: docSnap.id,
            userId: docSnap.data().userId,
            username: userData?.username || '',
            profilePic: userData?.profilePic || '',
            url: docSnap.data().mediaUrl,
            type: docSnap.data().type,
            duration: docSnap.data().duration,
            preloadResource: true,
            header: {
              heading: userData?.username || '',
              profileImage: userData?.profilePic || '',
            },
          } as Story;
        
      
        })
      );

      setFollowingStatus(storiesData);

      // Find the index of the story with the specified id
      const initialIndex = storiesData.findIndex((story) => story.id === id);

      if (initialIndex !== -1) {
        setCurrentIndex(initialIndex);
      }

      setLoading(false);
    };

    fetchFollowingStories();

    return () => {
      setLoading(false);
    };
  }, [user, id]);

  const goHome = () => {
    router.push('/home');
  };

  console.log(followingStatus);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-2xl text-gray-500">Loading...</p>
        </div>
      )}
      {followingStatus.length > 0 && (
        <div className="max-w-xl">
          <Stories
            stories={followingStatus}
            currentIndex={currentIndex}
            onStoryStart={() => console.log('Story Started')}
            onStoryEnd={() => console.log('Story Ended')}
            onAllStoriesEnd={() => console.log('All Stories Ended')}
            onNext={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % followingStatus.length)}
            onPrevious={() =>
              setCurrentIndex((prevIndex) => (prevIndex - 1 + followingStatus.length) % followingStatus.length)
            }
            isPaused={false}
            keyboardNavigation={true}
            header={({ header }: any) => {
              const currentStory:any = followingStatus[currentIndex];
              //console.log('Current Story:', currentStory);
              return (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentStory?.header?.profileImage || 'default-profile-image-url'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full bg-gray-300"
                    />
                    <p className="text-sm font-bold text-gray-200">{currentStory?.username}</p>
                  </div>
                </div>
              );
            }}
            preloadCount={1}
            width={'max-w-7xl'}
            height={'100vh'}
          />
       

        </div>
      )}
       <button className="absolute top-0 right-4 px-4 py-2 text-white rounded" onClick={goHome}>
       <IoMdClose className="w-8 h-8" />
      </button>
      
    </div>
  );
}

export default Page;
