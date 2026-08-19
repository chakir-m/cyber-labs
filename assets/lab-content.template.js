// assets/lab-content.template.js
//
// ============================================================================
// GABARIT — à copier dans le dossier de votre nouveau lab sous le nom
// "lab-content.js", puis à adapter. C'est le SEUL fichier vraiment différent
// d'un lab à l'autre : tout le reste (landing, pseudo, dashboard, QR, CSV,
// réinitialisation, mot de passe formateur, vue détail) est fourni par le
// moteur partagé (assets/lab-engine.js) et n'a jamais besoin d'être touché.
//
// Ce fichier doit définir un seul objet global : window.LabConfig
// ============================================================================

window.LabConfig = {
  // Identifiant unique du lab. DOIT être identique à window.LAB_ID défini
  // dans le index.html de ce même lab (sert à séparer les données dans
  // Firebase). Convention : "moduleX-nom-court".
  id: "moduleX-exemple",

  // Textes affichés sur l'écran d'accueil.
  title: "Titre du lab",
  moduleTag: "Module X · Lab interactif",
  description: "Une ou deux phrases qui expliquent le principe du jeu, affichées en grand sur l'écran d'accueil.",
  participantPitch: "Résumé d'une phrase de ce que fait un participant.",
  formateurPitch: "Résumé d'une phrase de ce que voit le formateur.",
  privacyNote: "Rappel court sur la confidentialité, adapté à ce lab précis.",

  // -------------------------------------------------------------------
  // 1. LE JEU LUI-MÊME
  // -------------------------------------------------------------------
  // Reçoit un <div> vide (container) à remplir avec votre interface (cartes
  // à trier, scénario à embranchements, question à choix multiples...) et
  // le pseudo du participant. Construisez votre interaction comme vous le
  // souhaitez (HTML généré en JS, gestion de clics, etc.).
  //
  // Quand le participant a terminé, appelez OBLIGATOIREMENT :
  //   LabEngine.submitResult({ ...vos champs personnalisés... })
  // Cela enregistre le résultat, l'envoie à Firebase, et affiche l'écran
  // de résumé (voir renderParticipantSummary ci-dessous).
  //
  // Le pseudo et l'horodatage sont ajoutés automatiquement — inutile de les
  // inclure vous-même dans l'objet passé à submitResult.
  renderGame(container, pseudo) {
    container.innerHTML = `
      <div class="card-shell" style="max-width:460px; margin:0 auto;">
        <h2>Exemple de question</h2>
        <p class="desc">Remplacez ceci par votre propre interface de jeu.</p>
        <button class="btn-primary" id="demo-btn">Valider ma réponse</button>
      </div>
    `;
    document.getElementById("demo-btn").onclick = () => {
      LabEngine.submitResult({ exempleScore: 1 });
    };
  },

  // -------------------------------------------------------------------
  // 2. RÉSUMÉ PERSONNEL (juste après avoir terminé, visible du participant
  //    uniquement)
  // -------------------------------------------------------------------
  renderParticipantSummary(container, record) {
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.exempleScore}<span class="unit">points</span></div>
        <div class="summary-msg"><strong>À retenir :</strong> votre message de clôture pédagogique ici.</div>
      </div>
    `;
  },

  // -------------------------------------------------------------------
  // 3. BADGE COMPACT (affiché dans la liste des participants du tableau
  //    de bord formateur — un petit résumé du score, en HTML court)
  // -------------------------------------------------------------------
  participantBadge(record) {
    return `<span class="score-chip mid">${record.exempleScore} pts</span>`;
  },

  // -------------------------------------------------------------------
  // 4. STATISTIQUES COLLECTIVES (zone libre au-dessus de la liste des
  //    participants dans le tableau de bord — graphiques, moyennes, etc.)
  // -------------------------------------------------------------------
  renderDashboardExtra(container, records) {
    const avg = records.reduce((s, r) => s + (r.exempleScore || 0), 0) / records.length;
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avg.toFixed(1)}</div><div class="l">Score moyen du groupe</div></div>
      </div>
    `;
  },

  // -------------------------------------------------------------------
  // 5. DÉTAIL INDIVIDUEL (nouvel onglet ouvert en cliquant sur un
  //    participant depuis le tableau de bord)
  // -------------------------------------------------------------------
  renderDetail(container, record) {
    container.innerHTML = `<p>Score : ${record.exempleScore} points.</p>`;
  },

  // -------------------------------------------------------------------
  // 6. COLONNES DE L'EXPORT CSV (optionnel — un export minimal existe par
  //    défaut si vous omettez cette propriété)
  // -------------------------------------------------------------------
  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => r.exempleScore || 0 },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
  ],
};
