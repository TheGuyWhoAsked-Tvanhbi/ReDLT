// Firebase Part
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCz-FPkOfqcdenQoQD5QVDLBvdtVlp0he4",
  authDomain: "redlt-4a5c8.firebaseapp.com",
  projectId: "redlt-4a5c8",
  storageBucket: "redlt-4a5c8.firebasestorage.app",
  messagingSenderId: "74648469314",
  appId: "1:74648469314:web:a033b225e978c7794d12db",
  measurementId: "G-B58K7SGDN9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);