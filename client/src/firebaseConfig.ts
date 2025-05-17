// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGCbmvrHhRkHdzbjfVFxjy0uE_yCzMzb8",
  authDomain: "fincity-429f7.firebaseapp.com",
  projectId: "fincity-429f7",
  storageBucket: "fincity-429f7.firebasestorage.app",
  messagingSenderId: "430420753787",
  appId: "1:430420753787:web:7add6de6bbf807ecc0d1de",
  measurementId: "G-FQH3FYFPR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
