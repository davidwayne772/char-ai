import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};
// ---------------------------------------

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Screens
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const dashView = document.getElementById('dashboard-screen');
const chatView = document.getElementById('chat-screen');
const createView = document.getElementById('create-character-screen');

function showView(view) {
    [dashView, chatView, createView].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
}

// Auth Logic
document.getElementById('register-btn').addEventListener('click', () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('password-input').value;
    createUserWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
});

document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('password-input').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    if (user) {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-display-name').innerText = user.email.split('@')[0];
        loadPublicCharacters();
    } else {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

// UI Navigation
document.getElementById('open-create-modal-btn').addEventListener('click', () => showView(createView));
document.getElementById('cancel-create-btn').addEventListener('click', () => showView(dashView));
document.getElementById('back-to-dash-btn').addEventListener('click', () => showView(dashView));

// Create Character
document.getElementById('character-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newChar = {
        name: document.getElementById('char-name').value,
        image: document.getElementById('char-image').value,
        desc: document.getElementById('char-desc').value,
        greeting: document.getElementById('char-greeting').value,
        definition: document.getElementById('char-def').value,
        visibility: document.getElementById('char-visibility').value,
        creatorId: auth.currentUser.uid
    };

    await addDoc(collection(db, "characters"), newChar);
    alert("Character Created!");
    showView(dashView);
});

// Load Characters
async function loadPublicCharacters() {
    const q = query(collection(db, "characters"), where("visibility", "==", "public"));
    const snapshot = await getDocs(q);
    const list = document.getElementById('character-list');
    list.innerHTML = "";
    
    snapshot.forEach(doc => {
        const char = doc.data();
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
            <img src="${char.image}">
            <div class="char-info">
                <h4>${char.name}</h4>
                <p>by ${char.desc}</p>
            </div>
        `;
        card.onclick = () => openChat(char);
        list.appendChild(card);
    });
}

function openChat(char) {
    showView(chatView);
    document.getElementById('chat-character-name').innerText = char.name;
    document.getElementById('chat-character-img').src = char.image;
    document.getElementById('chat-messages').innerHTML = `<div class="msg ai-msg">${char.greeting}</div>`;
}
