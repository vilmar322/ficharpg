README - Configurar Firebase e rodar localmente

1) Criar projeto no Firebase:
   - Acesse https://console.firebase.google.com and create a new project.

2) Ativar Authentication:
   - Vá em Authentication > Sign-in method > enable 'Email/Password'. See guide: Firebase Auth web start. citeturn0search2

3) Criar Firestore:
   - Firestore Database > Create database (Start in Production or Test). See quickstart. citeturn0search8

4) Configurar regras (exemplo mínimo para isolar fichas por uid):
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/fichas/{fichaId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   - Mais sobre regras e condições: see Firestore security rules. citeturn0search1turn0search3

5) Obter Firebase config:
   - Project settings (ícone de engrenagem) > General > 'Your apps' > Add web app > copiar firebaseConfig object e colar em app.js.

6) Rodar localmente:
   - Basta abrir index.html no navegador (ou usar um servidor local). app.js usa módulos ES e CDN da versão 9.22.2.

7) Notas:
   - createUserWithEmailAndPassword / signInWithEmailAndPassword são as funções usadas para criar e logar usuários. citeturn0search4turn0search7
