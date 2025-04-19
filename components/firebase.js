// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { initializeAuth } from 'firebase/auth';
import { getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBadXa4whttXZ0tMI2KkWK0QBE0PfOehNc",
  authDomain: "esgg-26f77.firebaseapp.com",
  projectId: "esgg-26f77",
  storageBucket: "esgg-26f77.firebasestorage.app",
  messagingSenderId: "157532419898",
  appId: "1:157532419898:web:34c5f954532689f52f4203"
};

// Initialize Firebase
// export const auth = initializeAuth(app);
const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });

  console.log(auth, 'this is auth')


export const db = getFirestore(app);
export const storage = getStorage(app);