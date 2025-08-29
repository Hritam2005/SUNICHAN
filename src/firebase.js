// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu5Nsm1BWqBVqw0U6JDl0Td5TLhAt75mo",
  authDomain: "my-first-firebase-projec-84f55.firebaseapp.com",
  projectId: "my-first-firebase-projec-84f55",
  storageBucket: "my-first-firebase-projec-84f55.appspot.com",
  messagingSenderId: "98452644046",
  appId: "1:98452644046:web:5d215a4036c87ca269309f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
