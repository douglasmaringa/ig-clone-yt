import React, { useState, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {  doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { toast } from 'react-hot-toast';

interface User {
    userId: string;
  name: string;
  bio: string;
  profilePic: string;
}

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
  reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditProfile({ open, setOpen, user,reload,setReload }: Props) {
  const [formData, setFormData] = useState<User>({ ...user });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setFormData((prevData) => ({ ...prevData, profilePic: imageUrl }));
      setFile(selectedFile); // Upload the image to Firebase Storage
    }
  };

  //upload image to firebase storage
  const handleSubmit = async () => {
    setLoading(true);
    let downloadURL = formData.profilePic; // Default to the existing profile picture

    try {
      if (file) {
      const storage = getStorage();
     
    
      const storageRef = ref(storage, `profile_images/${file?.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file? file : new Blob());
      // Wait for the image to be uploaded
      const snapshot = await uploadTask;
      
          downloadURL = await getDownloadURL(snapshot.ref);
      }
      // Update the user data in Firestore with the new photoUrl
      await updateDoc(doc(firestore, 'users', user.userId), {
        name: formData.name,
        bio: formData.bio,
        profilePic: downloadURL? downloadURL : formData.profilePic,
      });
      setLoading(false);
      toast.success(`Image uploaded and user updated successfully`);
        setReload(!reload);
      setOpen(false);
    } catch (error) {
        setLoading(false);
      toast.error(`Error uploading image, ${error}`);
    }
  };


  return (
    <div>
     
      <form>
      <div className='flex items-center space-x-4'>
            <Avatar className='w-40 h-40'>
            <AvatarImage src={formData.profilePic} />
            <AvatarFallback>CN</AvatarFallback>
            </Avatar>
         
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
          
        </div>

        <div className='mt-4'>
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            id="name"
            name="name"
            className='w-full max-w-md'
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className='mt-4'>
          <label htmlFor="name">Bio</label>
          <Input
            type="text"
            className='w-full max-w-md'
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
          />
        </div>

        
        <Button disabled={loading} className='mt-4 ml-auto' type="button" onClick={handleSubmit}>
            {
                loading ? (<>Loading</>) : (<>Save Changes</>)
            }
        </Button>
      </form>
    </div>
  );
}

export default EditProfile;
