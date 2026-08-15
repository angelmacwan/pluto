import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBAUJp11423dFSWzw2WfHxDMAUdK-ClAMI',
  authDomain: 'pluto-d0d5e.firebaseapp.com',
  projectId: 'pluto-d0d5e',
  storageBucket: 'pluto-d0d5e.firebasestorage.app',
  messagingSenderId: '223980234318',
  appId: '1:223980234318:web:581a11ac294484c0bd451f'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
