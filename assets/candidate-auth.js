// assets/candidate-auth.js
//
// ============================================================================
// AUTHENTIFICATION CANDIDAT — remplace le simple "nom retenu sur cet
// appareil" par un vrai compte Firebase Authentication (email + mot de
// passe). Chargé par TOUTES les pages qui nécessitent un candidat identifié :
// commencer.html, labs.html, mon-parcours.html, certificat.html, et chaque
// module*/index.html (via assets/lab-engine.js).
//
// Doit être chargé APRÈS :
//   firebase-app-compat.js, firebase-auth-compat.js, firebase-database-compat.js
//   assets/firebase-config.js
//
// Ce fichier ne contient AUCUN texte pédagogique — uniquement de la logique.
// Les pages appelantes gèrent leur propre UI (formulaires, messages d'erreur).
// ============================================================================

(function () {
  if (typeof firebase === "undefined") {
    console.error("[candidate-auth] Le SDK Firebase est introuvable — chargez firebase-app-compat.js, firebase-auth-compat.js et firebase-database-compat.js avant ce fichier.");
    return;
  }
  if (typeof firebaseConfig === "undefined") {
    console.error("[candidate-auth] firebaseConfig introuvable — vérifiez que assets/firebase-config.js est chargé avant ce fichier.");
    return;
  }
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.database();
  const DISPLAY_NAME_KEY = "participant_name"; // conservé pour compatibilité avec d'anciens affichages

  function rememberLocally(name) {
    try { localStorage.setItem(DISPLAY_NAME_KEY, name || ""); } catch (e) {}
  }
  function forgetLocally() {
    try { localStorage.removeItem(DISPLAY_NAME_KEY); } catch (e) {}
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  // Traduit les codes d'erreur Firebase Auth en messages compréhensibles en français.
  function friendlyError(err) {
    const code = err && err.code;
    const map = {
      "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail. Essayez de vous connecter plutôt.",
      "auth/invalid-email": "Cette adresse e-mail n'est pas valide.",
      "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
      "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
      "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
      "auth/network-request-failed": "Problème de connexion réseau. Réessayez.",
      "auth/user-disabled": "Ce compte a été désactivé.",
    };
    return map[code] || ("Une erreur est survenue (" + (code || "inconnue") + ").");
  }

  async function signUp(displayName, email, password) {
    const cleanName = String(displayName || "").trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) throw { code: "candidate-auth/missing-name" };
    const cred = await auth.createUserWithEmailAndPassword(cleanEmail, password);
    await cred.user.updateProfile({ displayName: cleanName });
    // "participants/{uid}" est le registre des comptes — lu par admin.html
    // pour savoir qui s'est inscrit, même avant tout lab commencé.
    await db.ref("participants/" + cred.user.uid).set({
      displayName: cleanName,
      email: cleanEmail,
      createdAt: Date.now(),
    });
    rememberLocally(cleanName);
    return cred.user;
  }

  async function signIn(email, password) {
    const cred = await auth.signInWithEmailAndPassword(normalizeEmail(email), password);
    rememberLocally(cred.user.displayName || cred.user.email || "");
    return cred.user;
  }

  async function resetPassword(email) {
    await auth.sendPasswordResetEmail(normalizeEmail(email));
  }

  async function signOutUser() {
    forgetLocally();
    await auth.signOut();
  }

  function currentUser() {
    return auth.currentUser;
  }

  function onAuthChange(cb) {
    return auth.onAuthStateChanged(cb);
  }

  // Calcule le bon chemin relatif vers un fichier à la racine du dépôt,
  // qu'on parte d'une page racine (labs.html...) ou d'un sous-dossier de lab
  // (module1-traqueur-exposition/index.html...).
  function pathToRoot(fileName) {
    const inLabFolder = /\/module\d+-[^\/]+\/(index\.html)?$/.test(location.pathname);
    return (inLabFolder ? "../" : "./") + fileName;
  }

  // Résout dès qu'on sait si quelqu'un est connecté. Si personne n'est
  // connecté, redirige immédiatement vers commencer.html (avec un paramètre
  // "next" pour revenir ici après connexion) et résout avec null — la page
  // appelante doit alors s'arrêter (la redirection est en cours).
  function requireAuth() {
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged((user) => {
        unsub();
        // Un utilisateur anonyme (utilisé uniquement par admin.html pour ses
        // propres opérations de maintenance — voir ce fichier) ne compte
        // jamais comme un candidat authentifié : sans ce filtre, un
        // formateur ayant ouvert admin.html sur un poste partagé laisserait
        // ce même navigateur accéder aux labs sans jamais passer par un
        // vrai compte candidat.
        if (user && !user.isAnonymous) {
          resolve(user);
          return;
        }
        const next = encodeURIComponent(location.pathname + location.search);
        location.href = pathToRoot("commencer.html") + "?next=" + next;
        resolve(null);
      });
    });
  }

  window.CandidateAuth = {
    signUp, signIn, resetPassword, signOut: signOutUser,
    currentUser, onAuthChange, requireAuth, pathToRoot, friendlyError,
  };
})();
