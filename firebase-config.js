// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get them from: Firebase Console > Project Settings > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyBWotJ1cSXYUftHm3nGyn-D7gp0D7mM3lg",
  authDomain: "liar-ea406.firebaseapp.com",
  databaseURL: "https://liar-ea406-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "liar-ea406",
  storageBucket: "liar-ea406.firebasestorage.app",
  messagingSenderId: "621092272404",
  appId: "1:621092272404:web:25b85617b9f79bff62aa01"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Export for use in game.js
window.db = database;

/* 
SETUP INSTRUCTIONS:
1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Enable Realtime Database:
   - Go to Build > Realtime Database
   - Click "Create Database"
   - Start in test mode (for development)
4. Get your config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Copy the firebaseConfig object
5. Replace the values above with your actual config
6. Set Database Rules (for development):
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       }
     }
   }

IMPORTANT: For production, implement proper security rules!
*/
