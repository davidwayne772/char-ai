// Screen Switching Logic
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

// Button Event Listeners
document.getElementById('login-btn').addEventListener('click', () => showScreen('dash'));
document.getElementById('open-create-modal-btn').addEventListener('click', () => showScreen('create'));
document.getElementById('cancel-create-btn').addEventListener('click', () => showScreen('dash'));
document.getElementById('back-to-dash-btn').addEventListener('click', () => showScreen('dash'));

// Placeholder for Login
document.getElementById('register-btn').addEventListener('click', () => {
    alert("In the next step, we will connect Firebase to make accounts actually work!");
    showScreen('dash');
});
