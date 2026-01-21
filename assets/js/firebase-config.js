/* firebase-config.js */

// Firebase config
var firebaseConfig = {
    apiKey: "AIzaSyDWpMVpSsyLKCOUoq92_mdYDfF5SuQ2g50",
    authDomain: "barangay-186-sys.firebaseapp.com",
    databaseURL: "https://barangay-186-sys-default-rtdb.firebaseio.com",
    projectId: "barangay-186-sys",
    storageBucket: "barangay-186-sys.appspot.com",
    messagingSenderId: "172329371822",
    appId: "1:172329371822:web:786b558e4b80418cde453f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize ALL firebase services correctly
window.auth = firebase.auth();              // Auth
window.realtimeDB = firebase.database();    // Realtime DB
window.firestore = firebase.firestore();    // Firestore
window.storage = firebase.storage();        // Storage

console.log("🔥 Firebase initialized successfully");
