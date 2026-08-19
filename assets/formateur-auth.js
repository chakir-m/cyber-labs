// assets/formateur-auth.js
//
// ============================================================================
// PROTECTION DU MODE FORMATEUR — même mot de passe pour tous les labs
// ============================================================================
//
// ⚠️ Important à comprendre : ce site est 100% statique (GitHub Pages), donc
// cette protection est une barrière LÉGÈRE, pas une sécurité forte. Le mot
// de passe est vérifié par un hash (pas stocké en clair), ce qui empêche une
// lecture triviale du code source, mais une personne très déterminée pourrait
// techniquement le contourner. Ne jamais s'en servir pour protéger des
// données réellement sensibles — son seul rôle ici est d'éviter qu'un
// participant curieux (ou quelqu'un tombant sur le QR code) ouvre par
// accident ou par jeu le tableau de bord formateur.
//
// -----------------------------------------------------------------------
// COMMENT CHANGER LE MOT DE PASSE (même procédure pour tous les labs) :
// -----------------------------------------------------------------------
// 1. Ouvrez n'importe quel lab dans votre navigateur.
// 2. Ouvrez la console développeur (touche F12, ou clic droit > Inspecter >
//    onglet Console).
// 3. Collez la ligne suivante en remplaçant "VOTRE_NOUVEAU_MOT_DE_PASSE" par
//    le mot de passe souhaité, puis appuyez sur Entrée :
//
//    crypto.subtle.digest("SHA-256", new TextEncoder().encode("VOTRE_NOUVEAU_MOT_DE_PASSE"))
//      .then(buf => console.log([...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("")))
//
// 4. Copiez la longue suite de lettres/chiffres affichée.
// 5. Collez-la ci-dessous, à la place de FORMATEUR_PASSWORD_HASH.
// 6. Republiez ce fichier sur GitHub — le nouveau mot de passe s'applique
//    immédiatement à tous les labs qui utilisent ce même fichier.
// ============================================================================

// Mot de passe par défaut : cyberdefense2026 — À CHANGER avant usage réel.
const FORMATEUR_PASSWORD_HASH = "08d1acaf5c5862256dce7bac1e497604cd6284cb53aa6848f569a6219a5b203d";

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Retourne true si l'accès formateur est autorisé (déjà validé dans cet onglet,
// ou mot de passe correctement saisi à l'instant). Retourne false sinon.
window.ensureFormateurAccess = async function () {
  if (sessionStorage.getItem("formateur_ok") === "1") return true;
  const pwd = prompt("Mot de passe formateur :");
  if (pwd === null) return false; // annulé
  const hash = await sha256Hex(pwd);
  if (hash === FORMATEUR_PASSWORD_HASH) {
    sessionStorage.setItem("formateur_ok", "1");
    return true;
  }
  alert("Mot de passe incorrect.");
  return false;
};
