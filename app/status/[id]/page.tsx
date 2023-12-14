"use client"
import React, { useEffect, useState } from 'react';
import Stories, { WithSeeMore, WithHeader } from 'react-insta-stories';
import { firestore, app } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Story {
  id: string;
  url: string;
  type?: 'image' | 'video';
  duration?: number;
  header?: {
    heading: string;
    subheading: string;
    profileImage: string;
  };
  seeMore?: React.ReactNode;
  seeMoreCollapsed?: React.ReactNode;
  styles?: any; // Override the default story styles mentioned in the documentation
  preloadResource?: boolean;
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

  //get user
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

//get statuses of people i follow
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

      const storiesData = storySnapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().mediaUrl,
        type: doc.data().type,
        duration: doc.data().duration,
        header: doc.data().header,
        preloadResource: true, // Adjust based on your needs
        // Add other story properties as needed
      } as Story));

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
  }, [user]);

  const goHome = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <button className="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={goHome}>
        Back to Home
      </button>
      {
        loading && (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-2xl text-gray-500">Loading...</p>
          </div>
        )
      }
      {followingStatus.length > 0 && (
        <div className='max-w-xl'>
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
          preloadCount={1}
          width={'max-w-7xl'}
          height={'100vh'}
        />
        </div>
      )}
      
    </div>
  );
}

export default Page;
