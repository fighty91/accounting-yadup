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
  apiKey: "AIzaSyAw44qqW7sGx8WJSp2fo3JSoHVfOQkgb80",
  authDomain: "yadupa-accounting-jayapura.firebaseapp.com",
  databaseURL: "https://yadupa-accounting-jayapura-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yadupa-accounting-jayapura",
  storageBucket: "yadupa-accounting-jayapura.appspot.com",
  messagingSenderId: "564250972361",
  appId: "1:564250972361:web:b13a27ca292cf20f3fbd18",
  measurementId: "G-8WWCNEHHJY"
}

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);




// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);



export default firebase