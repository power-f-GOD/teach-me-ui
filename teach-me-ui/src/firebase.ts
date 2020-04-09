import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyApEvo3ifzaKdyf6Sez8J6HnmTZA2_fHhg',
  authDomain: 'teach-me-demo.firebaseapp.com',
  databaseURL: 'https://teach-me-demo.firebaseio.com',
  projectId: 'teach-me-demo',
  storageBucket: 'teach-me-demo.appspot.com',
  messagingSenderId: '618432014498',
  appId: '1:618432014498:web:191709418cdaa68d37cffb',
  measurementId: 'G-X0SSVX8N1N',
};

export const teachMeApp = firebase.initializeApp(firebaseConfig);
export const database = teachMeApp.database();
