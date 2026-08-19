// assets/firebase-config.js
//
// ============================================================================
// CONFIGURATION FIREBASE — À REMPLIR UNE SEULE FOIS, PARTAGÉE PAR TOUS LES LABS
// ============================================================================
//
// D'où viennent ces valeurs ?
// 1. Aller sur https://console.firebase.google.com et créer un projet gratuit
//    (plan "Spark", aucune carte bancaire requise).
// 2. Dans le projet : "Build" > "Realtime Database" > "Créer une base de
//    données" > choisir une région (ex. europe-west1) > démarrer en mode test.
// 3. Cliquer sur l'icône ⚙️ (Paramètres du projet) > onglet "Général" >
//    section "Vos applications" > cliquer sur l'icône "</>" (Web).
// 4. Donner un nom (ex. "cyber-labs"), PAS besoin de cocher "Firebase Hosting"
//    puisque l'hébergement se fait sur GitHub Pages.
// 5. Copier l'objet "firebaseConfig" affiché et le coller ci-dessous, à la
//    place de l'objet d'exemple.
// 6. Retourner dans "Realtime Database" > onglet "Règles", et coller les
//    règles fournies dans le fichier README.md de ce dépôt, puis "Publier".
//
// Ce même fichier sera réutilisé, sans aucune modification, par tous les
// labs suivants du programme — chaque lab a son propre "LAB_ID" défini dans
// sa propre page HTML, ce qui sépare automatiquement les données de chaque
// exercice dans la même base de données.
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAWbJuG4awvWrV3gVvWMZiaN0dE3WXMHoo",
  authDomain: "cyber-labs-dabc5.firebaseapp.com",
  databaseURL: "https://cyber-labs-dabc5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cyber-labs-dabc5",
  storageBucket: "cyber-labs-dabc5.firebasestorage.app",
  messagingSenderId: "982756508641",
  appId: "1:982756508641:web:7e1af2afb5b889484c48a0",
};
