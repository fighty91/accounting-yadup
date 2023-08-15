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
  apiKey: "AIzaSyAOBouVas_oRcuDPwO5p0cfTCIhqNV1X3M",
  authDomain: "accounting-yadupa.firebaseapp.com",
  projectId: "accounting-yadupa",
  storageBucket: "accounting-yadupa.appspot.com",
  messagingSenderId: "13873007517",
  appId: "1:13873007517:web:576fbd31428abb0a11bd74",
  measurementId: "G-WXDB4E10ZD",
  databaseURL: "https://accounting-yadupa-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);




// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);



export default firebase