// firebase.js (ESM module for GitHub Pages)

// Firebase SDK (module URLs)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCW9guiIL96ryH37IKbMMXY1p8RkNTq5Dg",
  authDomain: "royo-logistics.firebaseapp.com",
  projectId: "royo-logistics",
  storageBucket: "royo-logistics.firebasestorage.app",
  messagingSenderId: "44032466230",
  appId: "1:44032466230:web:8b888253d7badd322aa797",
  measurementId: "G-G2ZJB063TB"
};

// Init
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
