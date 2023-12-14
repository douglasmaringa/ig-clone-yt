import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState,useEffect, ChangeEvent } from 'react';
import { FaPhotoVideo } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {  collection, addDoc,serverTimestamp } from 'firebase/firestore';
import { app,firestore } from '@/firebase';
import { Progress } from "@/components/ui/progress"

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;      
    }
    interface FileData {
        file: string | null;
        caption: string;
        type: 'image' | 'video' | null;
        upload:File | null;
      }

function StatusCreate({open,setOpen}:Props) {
  const storage = getStorage(app);
  const auth = getAuth(app);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  //get user from db
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user?.uid);
      } else {
        setUserId("");
      }
    });
    return () => unsubscribe();
  }, [auth]); 

  const [fileData, setFileData] = useState<FileData>({
    file: null,
    caption: '',
    type: null,
    upload:null,
  });
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
  
    if (selectedFile) {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        setFileData({
          file: reader.result as string,
          caption: '',
          upload:selectedFile,
          type: selectedFile.type.includes('image') ? 'image' : 'video',
        });
      };
  
      reader.readAsDataURL(selectedFile);
    }
  };
  
  

  const handleCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileData({ ...fileData, caption: event.target.value });
  };

  //upload post
  const handleNextClick = async () => {
    if (!fileData.file) return toast.error('Please select a file');
    if (!fileData.caption) return toast.error('Please enter a caption');
    setLoading(true);
  
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `posts/${fileData.upload!.name}}`);
      const uploadTask = uploadBytesResumable(storageRef, fileData.upload!);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading file:', error.message);
        },
        () => {
          // Upload complete, get download URL and log it
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Add a new document with a generated id.
            try {
            const docRef = addDoc(collection(firestore, "story"), {
              userId:userId,
              caption:fileData.caption,
              mediaUrl:downloadURL,
              timestamp:serverTimestamp(),
              type:fileData.type,
            });
            toast.success('story created successfully!');
            setOpen(false);
            setLoading(false);
             // Clear the state
                setFileData({
                    file: null,
                    caption: '',
                    type: null,
                    upload:null,
                });
            } catch (e) {
            toast.error('Failed to create story. Please try again.');
            setLoading(false);
            }
          });
        }
      );
    } catch (error) {
      //console.error('Error creating post:', error);
      toast.error('Failed to create story. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-center mt-5'>
        <label htmlFor="fileInput" className="cursor-pointer">
        <FaPhotoVideo className="w-20 h-20"/>
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {fileData.file && (
        <div className='flex items-center justify-center'>
          {fileData.type === 'image' ? (
            <img src={fileData.file} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
          ) : (
            <video src={fileData.file} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
          )}
        </div>
      )}

      {fileData.file && (
        <div className='mt-4'>
          <label htmlFor="captionInput">Caption:</label>
          <Input
            id="captionInput"
            type="text"
            value={fileData.caption}
            onChange={handleCaptionChange}
          />
        </div>
      )}

        {fileData.file && (
           <div className='flex mt-4 justify-between'>
            {loading && (
              <div className="flex items-center w-80">
                <Progress value={uploadProgress} />
              </div>
            )}
          
          <Button className='' onClick={handleNextClick}>
            {loading ? 'Uploading...' : 'Upload Post'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default StatusCreate