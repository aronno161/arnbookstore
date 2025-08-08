// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_Mwfx-HmOW7myFCroTxDElgpGdwZvTVs",
  authDomain: "arn-book-store.firebaseapp.com",
  // IMPORTANT: Make sure this URL is correct. Find it in your Firebase Console.
  databaseURL: "https://arn-book-store-default-rtdb.firebaseio.com/",
  projectId: "arn-book-store",
  storageBucket: "arn-book-store.appspot.com",
  messagingSenderId: "967954017733",
  appId: "1:967954017733:web:336bcdc08eb5cf37c9afac",
  measurementId: "G-L4N0H9H9YV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create global references to the database and auth services for other scripts to use
const database = firebase.database();
const auth = firebase.auth();