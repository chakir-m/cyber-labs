// assets/course-lock.js
//
// ============================================================================
// VERROUILLAGE DES LABS — permet au formateur d'activer les labs un par un
// au fur et à mesure de la formation, plutôt que de tous les rendre
// disponibles dès le premier jour.
//
// Principe : par défaut, un lab est VERROUILLÉ pour les participants tant que
// le formateur ne l'a pas explicitement activé depuis la page des labs
// (labs.html, mode formateur). Les participants voient toujours tous les
// labs dans la liste, mais ne peuvent pas ouvrir ceux qui sont verrouillés
// (grisés, non cliquables) — exactement comme demandé : « les participants
// peuvent les voir mais pas les passer ».
//
// Ce fichier doit être chargé APRÈS le SDK Firebase (compat) et après
// assets/firebase-config.js, sur toute page qui a besoin de lire ou modifier
// cet état : labs.html (hub) et chaque module*/index.html (pour bloquer
// l'accès si un participant arrive directement sur un lab, par exemple via
// un ancien lien ou un favori).
//
// Ce fichier est indépendant de window.LAB_ID : l'état de verrouillage est
// stocké dans un espace Firebase commun ("course/unlocked-labs"), partagé
// par tous les labs, contrairement à lab-storage.js qui isole chaque lab
// sous sa propre clé.
// ============================================================================

(function () {
  if (typeof firebase === "undefined") {
    console.error("[course-lock] Le SDK Firebase est introuvable — chargez firebase-app-compat.js et firebase-database-compat.js avant ce fichier.");
    return;
  }
  if (typeof firebaseConfig === "undefined") {
    console.error("[course-lock] firebaseConfig introuvable — vérifiez que assets/firebase-config.js est chargé avant ce fichier.");
    return;
  }

  // lab-storage.js a peut-être déjà initialisé l'app Firebase sur cette page
  // (c'est le cas dans chaque module*/index.html) — on évite une double
  // initialisation, qui lèverait une erreur.
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();
  const PATH = "course/unlocked-labs";

  function sanitizeId(labId) {
    return String(labId).replace(/[.#$\[\]\/]/g, "_");
  }

  window.CourseLock = {
    // Retourne { labId: true, ... } pour chaque lab explicitement déverrouillé.
    // Un lab absent de cet objet est considéré comme VERROUILLÉ par défaut.
    // En cas d'erreur (règles Firebase mal configurées, réseau...), on
    // retourne aussi _error:true pour que la page appelante puisse prévenir
    // le formateur au lieu d'afficher silencieusement tout en gris.
    async getUnlockedMap() {
      try {
        const snap = await db.ref(PATH).get();
        return snap.exists() ? snap.val() : {};
      } catch (e) {
        console.error("[course-lock] Erreur de lecture — vérifiez les règles Firebase (chemin 'course/unlocked-labs') :", e);
        return { _error: true };
      }
    },

    // NB : en cas d'erreur de lecture, on NE verrouille PAS le participant
    // (fail-open) — un problème technique de configuration ne doit jamais
    // empêcher un participant d'accéder à un lab. Le verrouillage explicite
    // (choix du formateur) reste, lui, pleinement respecté quand la lecture
    // fonctionne normalement.
    async isUnlocked(labId) {
      try {
        const snap = await db.ref(`${PATH}/${sanitizeId(labId)}`).get();
        return snap.exists() ? !!snap.val() : false;
      } catch (e) {
        console.error("[course-lock] Erreur de lecture pour", labId, "— accès autorisé par défaut (fail-open) :", e);
        return true;
      }
    },

    async setUnlocked(labId, unlocked) {
      try {
        const ref = db.ref(`${PATH}/${sanitizeId(labId)}`);
        if (unlocked) {
          await ref.set(true);
        } else {
          await ref.remove();
        }
        return true;
      } catch (e) {
        console.error("[course-lock] Erreur d'écriture pour", labId, "— vérifiez les règles Firebase (chemin 'course/unlocked-labs') :", e);
        return false;
      }
    },

    // Abonnement en direct : utile sur la page des labs pour refléter
    // immédiatement les changements faits par le formateur depuis un autre
    // appareil, sans que les participants aient besoin de recharger la page.
    onChange(callback) {
      db.ref(PATH).on(
        "value",
        (snap) => callback(snap.exists() ? snap.val() : {}),
        (err) => {
          console.error("[course-lock] Erreur d'abonnement en direct — vérifiez les règles Firebase :", err);
          callback({ _error: true });
        }
      );
    },

    stopListening() {
      db.ref(PATH).off();
    },
  };
})();
