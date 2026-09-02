// assets/lab-storage.js
//
// ============================================================================
// COUCHE DE STOCKAGE — reproduit l'API window.storage (get/set/list) au-dessus
// de Firebase Realtime Database, pour un hébergement 100% statique (GitHub
// Pages n'a pas de serveur : Firebase joue le rôle de petit backend gratuit).
//
// Chaque lab définit sa propre variable globale avant de charger ce fichier :
//   <script>window.LAB_ID = "module1-traqueur-exposition";</script>
//   <script src="../assets/firebase-config.js"></script>
//   <script src="../assets/lab-storage.js"></script>
//
// Le code du jeu lui-même (le script propre à chaque lab) continue d'utiliser
// exactement les mêmes appels que dans la version Claude.ai :
//   await window.storage.set(key, value, true)
//   await window.storage.get(key, true)
//   await window.storage.list(prefix, true)
// Rien d'autre à changer dans la logique du jeu.
// ============================================================================

(function () {
  if (!window.LAB_ID) {
    console.error("[lab-storage] window.LAB_ID n'est pas défini — chaque page de lab doit le définir avant de charger ce script.");
  }
  if (typeof firebaseConfig === "undefined") {
    console.error("[lab-storage] firebaseConfig introuvable — vérifiez que assets/firebase-config.js est chargé avant ce fichier.");
  }

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const LAB_ID = window.LAB_ID || "lab-sans-nom";
  const PENDING_KEY = "lab_pending_writes";

  // ==========================================================================
  // RÉSILIENCE RÉSEAU — si l'écriture Firebase échoue (Wi-Fi de la salle
  // coupé, par exemple), le résultat n'est JAMAIS perdu : il est mis en file
  // d'attente dans le localStorage de l'appareil, puis réémis automatiquement
  // dès que la connexion revient (au rechargement de la page, ou dès
  // l'événement "online" du navigateur).
  // ==========================================================================
  function readPendingQueue() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function writePendingQueue(queue) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("[lab-storage] Impossible d'écrire la file d'attente locale :", e);
    }
  }
  function queuePendingWrite(labId, key, value, shared) {
    const queue = readPendingQueue();
    queue.push({ labId, key, value, shared: !!shared, queuedAt: Date.now() });
    writePendingQueue(queue);
  }

  async function flushPendingWrites() {
    const queue = readPendingQueue();
    if (queue.length === 0) return { flushed: 0, remaining: 0 };
    const remaining = [];
    let flushed = 0;
    for (const item of queue) {
      try {
        const path = item.shared ? `labs/${item.labId}/shared` : `labs/${item.labId}/private/${getDeviceId()}`;
        await db.ref(`${path}/${sanitizeKey(item.key)}`).set({ value: String(item.value), ts: item.queuedAt });
        flushed++;
      } catch (e) {
        remaining.push(item); // toujours pas de réseau, on la garde pour le prochain essai
      }
    }
    writePendingQueue(remaining);
    if (flushed > 0) console.log(`[lab-storage] ${flushed} résultat(s) en attente synchronisé(s) avec succès.`);
    return { flushed, remaining: remaining.length };
  }

  // Tentative de synchronisation au chargement, puis dès que le navigateur
  // signale un retour de connexion réseau.
  setTimeout(flushPendingWrites, 1500);
  window.addEventListener("online", flushPendingWrites);

  // Les clés fournies par le jeu (ex. "resp:172839-ab12cd") contiennent des
  // caractères interdits dans les chemins Firebase (aucun ici en pratique,
  // mais on nettoie par sécurité).
  function sanitizeKey(key) {
    return String(key).replace(/[.#$\[\]\/]/g, "_");
  }

  function basePath(shared) {
    // "shared" correspond aux données visibles par tous les participants
    // et le formateur (tableau de bord). Une variante "privée" par appareil
    // est fournie par cohérence avec l'API d'origine, mais n'est pas utilisée
    // par les labs actuels.
    return shared ? `labs/${LAB_ID}/shared` : `labs/${LAB_ID}/private/${getDeviceId()}`;
  }

  function getDeviceId() {
    let id = localStorage.getItem("lab_device_id");
    if (!id) {
      id = "dev-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("lab_device_id", id);
    }
    return id;
  }

  window.storage = {
    async set(key, value, shared) {
      const k = sanitizeKey(key);
      try {
        await db.ref(`${basePath(shared)}/${k}`).set({ value: String(value), ts: Date.now() });
        return { key, value, shared: !!shared };
      } catch (e) {
        console.error("[lab-storage] Erreur d'écriture réseau, mise en file d'attente locale :", e);
        queuePendingWrite(LAB_ID, key, value, shared);
        return { key, value, shared: !!shared, queued: true };
      }
    },

    async get(key, shared) {
      const k = sanitizeKey(key);
      const snap = await db.ref(`${basePath(shared)}/${k}`).get();
      if (!snap.exists()) throw new Error("Clé introuvable : " + key);
      const data = snap.val();
      return { key, value: data.value, shared: !!shared };
    },

    async delete(key, shared) {
      const k = sanitizeKey(key);
      await db.ref(`${basePath(shared)}/${k}`).remove();
      return { key, deleted: true, shared: !!shared };
    },

    async list(prefix, shared) {
      const snap = await db.ref(basePath(shared)).get();
      if (!snap.exists()) return { keys: [], prefix: prefix || "", shared: !!shared };
      const all = Object.keys(snap.val());
      const keys = prefix ? all.filter((k) => k.startsWith(sanitizeKey(prefix))) : all;
      return { keys, prefix: prefix || "", shared: !!shared };
    },

    // Supprime toutes les données partagées (ou privées) de CE lab uniquement
    // — n'affecte jamais les autres labs, qui vivent sous un autre LAB_ID.
    async clear(shared) {
      try {
        await db.ref(basePath(shared)).remove();
        return { cleared: true, shared: !!shared };
      } catch (e) {
        console.error("[lab-storage] Erreur clear:", e);
        return null;
      }
    },

    // Tente de renvoyer immédiatement tout résultat resté en file d'attente
    // locale (utile par exemple si le formateur veut vérifier tout de suite
    // après avoir reconnecté le Wi-Fi, sans attendre le prochain rechargement).
    flushPending: flushPendingWrites,
  };
})();
