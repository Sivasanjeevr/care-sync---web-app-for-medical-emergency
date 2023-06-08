const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyDFOCdiK5K8UpH6OJpmHrZkYZud0V8kylE",
    authDomain: "ihealth-firebase.firebaseapp.com",
    projectId: "ihealth-firebase",
    storageBucket: "ihealth-firebase.appspot.com",
    messagingSenderId: "326231174978",
    appId: "1:326231174978:web:6eea973d4e5bc1564de2db",
    measurementId: "G-5X1XE5D6WD"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const User = db.collections("Users");
  module.exports=User;
