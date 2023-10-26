// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import 'firebase/auth'


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIvgBd_WbmuhXaCmt2BYFGf7oaQ-klfow",
  authDomain: "petra-accounting-jayapura.firebaseapp.com",
  databaseURL: "https://petra-accounting-jayapura-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "petra-accounting-jayapura",
  storageBucket: "petra-accounting-jayapura.appspot.com",
  messagingSenderId: "621194032542",
  appId: "1:621194032542:web:c1cb48f152b426903c928f",
  measurementId: "G-QJG0LWTX16"
}

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);




// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);



export default firebase