// module1-traqueur-exposition/lab-content.js
//
// Contenu spécifique du Lab 1 (Module 1). Voir assets/lab-content.template.js
// pour la description complète du contrat attendu par le moteur partagé.

const ACCOUNT_TYPES = [
  // --- Version originale (10) ---
  { id: "mail-perso", cat: "Email", label: "Ma boîte mail personnelle", core: true },
  { id: "mail-pro", cat: "Email", label: "Ma messagerie professionnelle", core: true },
  { id: "banque", cat: "Banque", label: "Mon compte bancaire principal", core: true },
  { id: "paiement", cat: "Banque", label: "Une application de paiement mobile", core: true },
  { id: "reseau", cat: "Réseaux sociaux", label: "Mon réseau social principal", core: true },
  { id: "messagerie", cat: "Réseaux sociaux", label: "Une messagerie instantanée", core: true },
  { id: "impots", cat: "Administratif", label: "Mon espace impôts / administration", core: true },
  { id: "secu", cat: "Administratif", label: "Mon compte sécurité sociale / CNSS", core: true },
  { id: "outil-pro", cat: "Professionnel", label: "Un outil professionnel (CRM, ERP, intranet)", core: true },
  { id: "cloud", cat: "Professionnel", label: "Mon espace de stockage cloud personnel", core: true },
  // --- Ajouts : comptes sensibles ou importants supplémentaires (10) ---
  { id: "gestionnaire-mdp", cat: "Sécurité", label: "Mon gestionnaire de mots de passe" },
  { id: "vpn-teletravail", cat: "Professionnel", label: "Mon accès VPN ou bureau à distance professionnel" },
  { id: "sante-dossier", cat: "Santé", label: "Mon dossier médical en ligne / téléconsultation" },
  { id: "identite-nat", cat: "Identité & documents", label: "Mon identité numérique nationale (CNIE électronique, portail public)" },
  { id: "investissement", cat: "Banque", label: "Un compte d'investissement ou de cryptomonnaies" },
  { id: "achat-marchand", cat: "Banque", label: "Un compte marchand avec carte enregistrée (achats en ligne)" },
  { id: "assurance", cat: "Administratif", label: "Mon compte assurance (auto, habitation, santé)" },
  { id: "scolarite", cat: "Administratif", label: "Le compte scolaire / universitaire de mes enfants" },
  { id: "photos-cloud", cat: "Identité & documents", label: "Mon espace de stockage de photos personnelles" },
  { id: "fidelite-voyage", cat: "Loisirs & consommation", label: "Un compte de fidélité voyage (avion, hôtel)" },
];

let gameList = ACCOUNT_TYPES.filter((t) => t.core);
let idx = 0;
let answers = {};

const CAT_ICON = {
  "Email": "📧",
  "Banque": "💳",
  "Réseaux sociaux": "💬",
  "Administratif": "🏛️",
  "Professionnel": "💼",
  "Sécurité": "🔐",
  "Santé": "🩺",
  "Identité & documents": "🪪",
  "Loisirs & consommation": "🎟️",
};

window.LabConfig = {
  id: "module1-traqueur-exposition",
  title: "Traqueur d'Exposition",
  moduleTag: "Module 1 · Lab interactif",
  description:
    "Un jeu de tri rapide pour prendre conscience, en équipe, du nombre de comptes réellement sensibles que chacun gère au quotidien — sans jamais révéler le moindre détail personnel.",
  participantPitch: "Triez 10 à 20 types de comptes en quelques minutes et découvrez votre score d'exposition, en toute confidentialité.",
  formateurPitch: "Suivez la progression du groupe en direct et préparez votre débrief avec des statistiques collectives.",
  privacyNote: "Aucune donnée personnelle réelle n'est demandée : le jeu porte sur des types de comptes, jamais sur vos identifiants ou vos comptes précis.",

  renderGame(container, pseudo) {
    idx = 0;
    answers = {};
    gameList = ACCOUNT_TYPES; // version complète uniquement (20 cartes)
    renderCardStack(container);
  },

  renderParticipantSummary(container, record) {
    const msg =
      record.high >= 3
        ? "C'est au-dessus de la moyenne : vous gérez plusieurs comptes dont la compromission aurait un impact réel."
        : "Un score maîtrisé — restez tout de même vigilant sur ces comptes au quotidien.";
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat — visible par vous seul(e)</span>
        <div class="big-number">${record.high}<span class="unit">comptes à impact élevé</span></div>
        <p class="summary-sub">${msg}</p>
        <div class="mini-stats">
          <div class="mini-stat low"><div class="n">${record.low}</div><div class="l">FAIBLE</div></div>
          <div class="mini-stat mid"><div class="n">${record.mid}</div><div class="l">MOYEN</div></div>
          <div class="mini-stat high"><div class="n">${record.high}</div><div class="l">ÉLEVÉ</div></div>
        </div>
        <div class="summary-msg">
          <strong>À retenir :</strong> chaque compte à impact élevé mérite un mot de passe unique et, si possible, une authentification multifacteur — deux réflexes détaillés en profondeur au <strong>Module 5</strong> de ce parcours. Ce jeu n'a jamais demandé le moindre identifiant réel : seuls des <strong>types</strong> de comptes et vos niveaux de sensibilité perçus sont visibles par le formateur, jamais vos comptes précis, mots de passe ou données personnelles.
        </div>
      </div>
    `;
  },

  participantBadge(record) {
    return `
      <span class="score-chip low" title="Comptes à impact faible">${record.low || 0} F</span>
      <span class="score-chip mid" title="Comptes à impact moyen">${record.mid || 0} M</span>
      <span class="score-chip high" title="Comptes à impact élevé">${record.high || 0} É</span>
    `;
  },

  renderDashboardExtra(container, records) {
    const totalHigh = records.reduce((s, r) => s + (r.high || 0), 0);
    const agg = {};
    ACCOUNT_TYPES.forEach((t) => (agg[t.id] = { faible: 0, moyen: 0, eleve: 0 }));
    records.forEach((r) => {
      ACCOUNT_TYPES.forEach((t) => {
        const a = r.perType && r.perType[t.id];
        if (a && a.has) agg[t.id][a.sens] = (agg[t.id][a.sens] || 0) + 1;
      });
    });
    const rows = ACCOUNT_TYPES.map((t) => {
      const a = agg[t.id];
      const total = a.faible + a.moyen + a.eleve;
      const pctHigh = total > 0 ? Math.round((a.eleve / total) * 100) : 0;
      return { t, a, total, pctHigh };
    }).sort((x, y) => y.pctHigh - x.pctHigh);

    let barsHtml = "";
    rows.forEach((r) => {
      const total = r.total || 1;
      const wLow = (r.a.faible / total) * 100, wMid = (r.a.moyen / total) * 100, wHigh = (r.a.eleve / total) * 100;
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">${LabEngine.escapeHtml(r.t.label)}<span class="bar-cat">${r.t.cat} · ${r.total} possesseur(s)</span></div>
          <div class="bar-track">
            <div class="bar-seg low" style="width:${wLow}%"></div>
            <div class="bar-seg mid" style="width:${wMid}%"></div>
            <div class="bar-seg high" style="width:${wHigh}%"></div>
          </div>
          <div class="bar-pct">${r.total > 0 ? r.pctHigh + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card"><div class="n">${(totalHigh / records.length).toFixed(1)}</div><div class="l">Comptes « élevé » en moyenne / personne</div></div>
        <div class="stat-card accent"><div class="n">${totalHigh}</div><div class="l">Total de comptes sensibles identifiés dans la salle</div></div>
      </div>
      <div class="section-title">Perception de sensibilité par type de compte</div>
      <div>${barsHtml}</div>
      <div class="legend">
        <span><i class="low"></i> Faible</span>
        <span><i class="mid"></i> Moyen</span>
        <span><i class="high"></i> Élevé — trié du plus au moins consensuel</span>
      </div>
    `;
  },

  renderDetail(container, record) {
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card"><div class="n">${record.low || 0}</div><div class="l">Comptes faibles</div></div>
        <div class="stat-card"><div class="n">${record.mid || 0}</div><div class="l">Comptes moyens</div></div>
        <div class="stat-card accent"><div class="n">${record.high || 0}</div><div class="l">Comptes élevés</div></div>
      </div>
      <div class="section-title">Réponse type par type</div>
      <div style="max-width:520px;">${buildTypeDetail(record)}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    { header: "Comptes faible", get: (r) => r.low || 0 },
    { header: "Comptes moyen", get: (r) => r.mid || 0 },
    { header: "Comptes élevé", get: (r) => r.high || 0 },
  ],
};

/* ============ Logique du jeu de tri (interne à ce lab) ============ */
function renderCardStack(container) {
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
      <div class="progress-label" id="progress-label">CARTE 1 / ${gameList.length}</div>
    </div>
    <div style="max-width:400px; margin:0 auto;">
      <div class="badge-card fade-in" id="badge-card">
        <div class="hole"></div>
        <div id="card-icon" style="text-align:center; font-size:34px; margin-top:6px;">🔖</div>
        <div class="cat-tag" id="card-cat">CATÉGORIE</div>
        <div class="type-label" id="card-label">Type de compte</div>
        <div class="badge-strip">
          <div class="q-label">Avez-vous ce type de compte ?</div>
          <div class="toggle-row">
            <button class="toggle-btn" id="toggle-oui">Oui, j'en ai un</button>
            <button class="toggle-btn" id="toggle-non">Non, pas moi</button>
          </div>
          <div class="sens-label">Si un inconnu y accédait, l'impact serait…</div>
          <div class="sens-row">
            <button class="sens-btn" data-lvl="faible">FAIBLE</button>
            <button class="sens-btn" data-lvl="moyen">MOYEN</button>
            <button class="sens-btn" data-lvl="eleve">ÉLEVÉ</button>
          </div>
        </div>
      </div>
      <div class="nav-row">
        <button class="btn-ghost" id="btn-prev">← Précédent</button>
        <button class="btn-next" id="btn-next" disabled>Suivant →</button>
      </div>
    </div>
  `;
  document.getElementById("toggle-oui").onclick = () => setHas(true);
  document.getElementById("toggle-non").onclick = () => setHas(false);
  document.querySelectorAll(".sens-btn").forEach((b) => (b.onclick = () => setSens(b.dataset.lvl)));
  document.getElementById("btn-prev").onclick = () => { if (idx > 0) { idx--; renderCard(); } };
  document.getElementById("btn-next").onclick = () => nextCard();
  renderCard();
}

function renderCard() {
  const t = gameList[idx];
  document.getElementById("card-cat").textContent = t.cat;
  document.getElementById("card-label").textContent = t.label;
  document.getElementById("card-icon").textContent = CAT_ICON[t.cat] || "🔖";
  document.getElementById("progress-fill").style.width = (idx / gameList.length) * 100 + "%";
  document.getElementById("progress-label").textContent = "CARTE " + (idx + 1) + " / " + gameList.length;

  const a = answers[t.id] || {};
  document.getElementById("toggle-oui").classList.toggle("active", a.has === true);
  document.getElementById("toggle-non").classList.toggle("active", a.has === false);
  document.querySelectorAll(".sens-btn").forEach((b) => {
    b.classList.toggle("active", a.sens === b.dataset.lvl);
    b.disabled = a.has === undefined;
  });
  document.getElementById("btn-prev").style.visibility = idx === 0 ? "hidden" : "visible";
  updateNextState();
}

function setHas(val) {
  const t = gameList[idx];
  answers[t.id] = Object.assign({}, answers[t.id], { has: val });
  if (val === false) answers[t.id].sens = answers[t.id].sens || "faible";
  renderCard();
}
function setSens(lvl) {
  const t = gameList[idx];
  if (!answers[t.id] || answers[t.id].has === undefined) return;
  answers[t.id].sens = lvl;
  renderCard();
}
function updateNextState() {
  const t = gameList[idx];
  const a = answers[t.id];
  const ready = a && a.has !== undefined && a.sens;
  document.getElementById("btn-next").disabled = !ready;
  document.getElementById("btn-next").textContent = idx === gameList.length - 1 ? "Voir mon résultat →" : "Suivant →";
}
function nextCard() {
  const t = gameList[idx];
  if (!answers[t.id] || answers[t.id].sens === undefined) return;
  if (idx < gameList.length - 1) {
    idx++;
    renderCard();
  } else {
    finishGame();
  }
}
function finishGame() {
  let low = 0, mid = 0, high = 0;
  const perType = {};
  ACCOUNT_TYPES.forEach((t) => {
    const a = answers[t.id];
    perType[t.id] = a || { has: false, sens: "faible" };
    if (a && a.has) {
      if (a.sens === "faible") low++;
      else if (a.sens === "moyen") mid++;
      else if (a.sens === "eleve") high++;
    }
  });
  LabEngine.submitResult({ low, mid, high, perType });
}
function buildTypeDetail(record) {
  const perType = record.perType || {};
  return ACCOUNT_TYPES.map((t) => {
    const a = perType[t.id];
    const has = a && a.has;
    const sens = a ? a.sens : null;
    const sensLabel = sens ? sens.toUpperCase() : "—";
    const sensClass = sens === "eleve" ? "high" : sens === "moyen" ? "mid" : "low";
    return `
      <div style="display:flex; align-items:center; gap:10px; padding:6px 0; font-size:12.5px;">
        <span style="flex:1; color:${has ? "var(--ink)" : "var(--gray)"};">${has ? "●" : "○"} ${LabEngine.escapeHtml(t.label)}</span>
        <span style="font-family:var(--mono); font-size:10px; color:var(--gray); width:70px;">${t.cat}</span>
        ${has ? `<span class="score-chip ${sensClass}" style="min-width:60px;">${sensLabel}</span>` : `<span style="font-family:var(--mono); font-size:11px; color:var(--gray); width:60px; text-align:center;">n'a pas</span>`}
      </div>`;
  }).join("");
}
