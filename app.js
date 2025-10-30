// Core app script — mantém autenticação, home, criação e edição de fichas completas.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { 
  getFirestore, doc, setDoc, collection, addDoc, getDocs, getDoc, deleteDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyD8uCjgNksO5Q-tUstU35l0i0-zV9Q8Afs",
  authDomain: "rpg-47ea9.firebaseapp.com",
  projectId: "rpg-47ea9",
  storageBucket: "rpg-47ea9.firebasestorage.app",
  messagingSenderId: "916943553595",
  appId: "1:916943553595:web:8b0736d7b284dcede9081e",
  measurementId: "G-XHS92VBMNM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper — mensagens
function show(msg){ const el = document.getElementById('messages'); if(el) el.textContent = msg; else console.log(msg); }

// --- PÁGINA: index.html ---
if(location.pathname.endsWith('index.html') || location.pathname.endsWith('/')){
  const btnReg = document.getElementById('btnRegister');
  const btnLogin = document.getElementById('btnLogin');

  btnReg.addEventListener('click', async()=>{
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    if(!name || !email || pass.length<8){ show('Preencha nome, email e senha com mínimo 8 caracteres.'); return; }
    try{
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, 'users', userCred.user.uid), { username: name, email, createdAt: Date.now() });
      location.href = 'home.html';
    }catch(e){ show('Erro ao criar conta: '+e.message); }
  });

  btnLogin.addEventListener('click', async()=>{
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if(!email || !pass){ show('Preencha email e senha'); return; }
    try{
      await signInWithEmailAndPassword(auth, email, pass);
      location.href = 'home.html';
    }catch(e){ show('Erro ao entrar: '+e.message); }
  });
}

// --- PÁGINA: home.html ---
if(location.pathname.endsWith('home.html')){
  const btnLogout = document.getElementById('btnLogout');
  const fichasList = document.getElementById('fichasList');
  const btnNew = document.getElementById('btnNew');

  btnLogout.addEventListener('click', async()=>{ await signOut(auth); location.href='index.html'; });
  btnNew.addEventListener('click', ()=> location.href='ficha.html');

  auth.onAuthStateChanged(async user=>{
    if(!user){ location.href='index.html'; return; }

    const colRef = collection(db, 'users', user.uid, 'fichas');
    const snap = await getDocs(colRef);
    fichasList.innerHTML = '';
    snap.forEach(docSnap=>{
      const data = docSnap.data();
      const el = document.createElement('div'); el.className='card-item';
      el.innerHTML = `
        <strong>${data.title || 'Sem título'}</strong>
        <div class="muted">Personagem: ${data.characterName || '-'}</div>
        <div class="actions">
          <button class="btn view" data-id="${docSnap.id}">Abrir</button>
          <button class="btn ghost del" data-id="${docSnap.id}">Excluir</button>
        </div>`;
      fichasList.appendChild(el);
    });

    fichasList.addEventListener('click', (e)=>{
      if(e.target.classList.contains('view')){
        const id = e.target.dataset.id;
        location.href = 'ficha.html?id='+id;
      }
      if(e.target.classList.contains('del')){
        const id = e.target.dataset.id;
        deleteDoc(doc(db, 'users', user.uid, 'fichas', id)).then(()=>location.reload());
      }
    });
  });
}

// --- PÁGINA: ficha.html ---
if(location.pathname.endsWith('ficha.html')){
  const btnBack = document.getElementById('btnBack');
  const btnSave = document.getElementById('btnSave');
  const btnDelete = document.getElementById('btnDelete');
  const formTitle = document.getElementById('formTitle');

  btnBack.addEventListener('click', ()=> location.href='home.html');

  let currentId = null;
  const params = new URLSearchParams(location.search);
  if(params.has('id')) currentId = params.get('id');

  auth.onAuthStateChanged(async user=>{
    if(!user){ location.href='index.html'; return; }

    // --- carregar ficha existente ---
    if(currentId){
      const docRef = doc(db, 'users', user.uid, 'fichas', currentId);
      const snap = await getDoc(docRef);
      if(snap.exists()){
        const data = snap.data();
        formTitle.textContent = 'Editar Ficha';
        for(const k in data){
          if(document.getElementById(k)) document.getElementById(k).value = data[k];
        }
      }
    } else {
      btnDelete.style.display = 'none';
    }

    // --- salvar ficha (nova ou atualização) ---
    btnSave.addEventListener('click', async e=>{
      e.preventDefault();

      const payload = {
        title: document.getElementById('title')?.value || '',
        playerName: document.getElementById('playerName')?.value || '',
        characterName: document.getElementById('characterName')?.value || '',
        ClassLevel: document.getElementById('ClassLevel')?.value || '',
        Race: document.getElementById('Race')?.value || '',
        Alignment: document.getElementById('Alignment')?.value || '',
        STR: Number(document.getElementById('STR')?.value) || 10,
        DEX: Number(document.getElementById('DEX')?.value) || 10,
        CON: Number(document.getElementById('CON')?.value) || 10,
        INT: Number(document.getElementById('INT')?.value) || 10,
        WIS: Number(document.getElementById('WIS')?.value) || 10,
        CHA: Number(document.getElementById('CHA')?.value) || 10,
        HPMax: Number(document.getElementById('HPMax')?.value) || 0,
        HPAtual: Number(document.getElementById('HPAtual')?.value) || 0,
        Equipment: document.getElementById('Equipment')?.value || '',
        ProficienciesLang: document.getElementById('ProficienciesLang')?.value || '',
        features: document.getElementById('features')?.value || '',
        backstory: document.getElementById('backstory')?.value || '',
        updatedAt: Date.now()
      };

      if(currentId){
        await setDoc(doc(db, 'users', user.uid, 'fichas', currentId), payload, { merge: true });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'fichas'), payload);
      }

      location.href = 'home.html';
    });

    // --- excluir ficha ---
    btnDelete.addEventListener('click', async()=>{
      if(!confirm('Excluir esta ficha?')) return;
      if(currentId){
        await deleteDoc(doc(db, 'users', user.uid, 'fichas', currentId));
      }
      location.href = 'home.html';
    });
  });
}
