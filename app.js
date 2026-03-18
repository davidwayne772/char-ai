// 1. IMPORT FIREBASE LIBRARIES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. YOUR FIREBASE CONFIG (PASTE YOUR INFO FROM STEP 3 HERE)
const firebaseConfig = {
  apiKey: "AIzaSyDZHWlIlrqqqpjOGFlZmp63ubRQkpRLReo",
  authDomain: "ai-roleplay-chat-66485.firebaseapp.com",
  projectId: "ai-roleplay-chat-66485",
  storageBucket: "ai-roleplay-chat-66485.firebasestorage.app",
  messagingSenderId: "417127627684",
  appId: "1:417127627684:web:8032795157acc5f9d25f31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- APP LOGIC ---

const screens = {
    auth: document.getElementById('auth-screen'),
    dash: document.getElementById('dashboard-screen'),
    create: document.getElementById('create-character-screen'),
    chat: document.getElementById('chat-screen')
};

function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenKey].classList.remove('hidden');
}

// REGISTER NEW USER
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('password-input').value;
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Account Created!");
    } catch (error) {
        alert(error.message);
    }
});

// LOGIN USER
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('password-input').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        alert(error.message);
    }
});

// LOGOUT
document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// MONITOR AUTH STATE (Checks if you are logged in or out)
onAuthStateChanged(auth, (user) => {
    if (user) {
        showScreen('dash');
        loadCharacters(); // We'll build this next!
    } else {
        showScreen('auth');
    }
});

// Navigation Buttons
document.getElementById('open-create-modal-btn').addEventListener('click', () => showScreen('create'));
document.getElementById('cancel-create-btn').addEventListener('click', () => showScreen('dash'));
