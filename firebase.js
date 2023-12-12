// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCxqrmfnlTNBMii0Jqf12lHLzwqceN4QQE",
    authDomain: "ig-clone-yt-3dcf6.firebaseapp.com",
    projectId: "ig-clone-yt-3dcf6",
    storageBucket: "ig-clone-yt-3dcf6.appspot.com",
    messagingSenderId: "601830365398",
    appId: "1:601830365398:web:36207b98569e327fa51177",
    measurementId: "G-FGX352T7VT"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };