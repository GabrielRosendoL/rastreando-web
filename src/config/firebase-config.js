// Importa o Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBu4VwzbBEdwxyjQG22ZNDEWv_jHtkmRH4",
  authDomain: "rastreando-app.firebaseapp.com",
  projectId: "rastreando-app",
  storageBucket: "rastreando-app.appspot.com",
  messagingSenderId: "824374445447",
  appId: "1:824374445447:web:5c43bedac9e13877403f22",
  measurementId: "G-88P95B1R5M"
};

// Agora você pode usar o Firestore e o Auth em seu projeto

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
