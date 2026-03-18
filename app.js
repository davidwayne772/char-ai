import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDZHWlIlrqqqpjOGFlZmp63ubRQkpRLReo",
    authDomain: "ai-roleplay-chat-66485.firebaseapp.com",
    databaseURL: "https://ai-roleplay-chat-66485-default-rtdb.firebaseio.com",
    projectId: "ai-roleplay-chat-66485",
    storageBucket: "ai-roleplay-chat-66485.firebasestorage.app",
    messagingSenderId: "417127627684",
    appId: "1:417127627684:web:8032795157acc5f9d25f31"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global State
let currentChatPartnerId = null;

// HTML Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const dashView = document.getElementById('dashboard-screen');
const chatView = document.getElementById('chat-screen');
const createView = document.getElementById('create-character-screen');
const chatMessages = document.getElementById('chat-messages');

function showView(view) {
    [dashView, chatView, createView].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
}

// --- AUTHENTICATION ---
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
        loadRecentChats();
    } else {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

// --- NAVIGATION ---
document.getElementById('open-create-modal-btn').addEventListener('click', () => showView(createView));
document.getElementById('cancel-create-btn').addEventListener('click', () => showView(dashView));
document.getElementById('back-to-dash-btn').addEventListener('click', () => showView(dashView));

// --- CHARACTER LOGIC ---
document.getElementById('character-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newChar = {
        name: document.getElementById('char-name').value,
        image: document.getElementById('char-image').value,
        desc: document.getElementById('char-desc').value,
        greeting: document.getElementById('char-greeting').value,
        definition: document.getElementById('char-def').value,
        visibility: document.getElementById('char-visibility').value,
        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "characters"), newChar);
    alert("Character Created!");
    showView(dashView);
    loadPublicCharacters();
});

async function loadPublicCharacters() {
    const q = query(collection(db, "characters"), where("visibility", "==", "public"));
    const snapshot = await getDocs(q);
    const list = document.getElementById('character-list');
    list.innerHTML = "";
    
    snapshot.forEach(doc => {
        const char = doc.data();
        const charId = doc.id;
        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
            <img src="${char.image}">
            <div class="char-info">
                <h4>${char.name}</h4>
                <p>${char.desc}</p>
            </div>
        `;
        card.onclick = () => openChat(charId, char);
        list.appendChild(card);
    });
}

// --- CHAT LOGIC ---
async function openChat(charId, charData) {
    currentChatPartnerId = charId;
    showView(chatView);
    document.getElementById('chat-character-name').innerText = charData.name;
    document.getElementById('chat-character-img').src = charData.image;
    
    // Listen for messages in real-time
    const q = query(
        collection(db, "chats"), 
        where("userId", "==", auth.currentUser.uid),
        where("charId", "==", charId),
        orderBy("timestamp", "asc")
    );

    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = `<div class="msg ai-msg">${charData.greeting}</div>`;
        snapshot.forEach(doc => {
            const msg = doc.data();
            const div = document.createElement('div');
            div.className = `msg ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`;
            div.innerText = msg.text;
            chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

document.getElementById('send-msg-btn').addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text || !currentChatPartnerId) return;

    input.value = "";
    
    // Save User Message
    await addDoc(collection(db, "chats"), {
        userId: auth.currentUser.uid,
        charId: currentChatPartnerId,
        text: text,
        role: 'user',
        timestamp: serverTimestamp()
    });

    // Placeholder for AI Response (We will add the "Brain" here next)
    console.log("AI would reply to:", text);
});

// Load Sidebar "Recent Chats"
async function loadRecentChats() {
    // This is a simplified version that just shows your created characters for now
    const q = query(collection(db, "characters"), where("creatorId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    const list = document.getElementById('recent-list');
    list.innerHTML = "";
    snapshot.forEach(doc => {
        const char = doc.data();
        const div = document.createElement('div');
        div.className = 'nav-item';
        div.innerText = char.name;
        div.onclick = () => openChat(doc.id, char);
        list.appendChild(div);
    });
}
