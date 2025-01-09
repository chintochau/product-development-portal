// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
const appId = import.meta.env.VITE_FIREBASE_APP_ID
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID

const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);

// setup firestore
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);


// Initialize Firebase Authentication and get a reference to the service

