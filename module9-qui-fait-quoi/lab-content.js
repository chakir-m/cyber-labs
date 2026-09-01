// module9-qui-fait-quoi/lab-content.js
//
// Lab 1 du Module 9 : associer 6 descriptions au bon texte légal, autorité
// ou norme, parmi 8 options (cadre marocain + standards internationaux).
// Choix unique, feedback immédiat. Même mécanique que Détective des
// Malwares (Module 3) : grille de boutons à choix unique.

const ENTITIES = [
  { key: "dgssi", label: "DGSSI" },
  { key: "loi0520", label: "Loi 05-20" },
  { key: "dnssi", label: "DNSSI" },
  { key: "cndp", label: "CNDP" },
  { key: "loi0908", label: "Loi 09-08" },
  { key: "macert", label: "maCERT" },
  { key: "iso27001", label: "ISO/IEC 27001" },
  { key: "nistcsf", label: "NIST CSF" },
];
const ENTITY_LABEL = Object.fromEntries(ENTITIES.map((e) => [e.key, e.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Ce texte légal, promulgué le 25 juillet 2020, fixe les règles de sécurité applicables aux administrations, établissements publics et infrastructures d'importance vitale au Maroc.",
    answer: "loi0520",
    explanation: "La loi 05-20 relative à la cybersécurité fixe précisément ce périmètre d'application — administrations, établissements publics, infrastructures d'importance vitale et certains opérateurs privés stratégiques.",
  },
  {
    id: "B",
    text: "Ce référentiel technique traduit les obligations légales marocaines en mesures concrètes, organisationnelles et techniques, classées selon le niveau de sensibilité des systèmes concernés.",
    answer: "dnssi",
    explanation: "La DNSSI est le volet technique du cadre légal marocain : elle transforme les obligations de la loi 05-20 en mesures applicables, organisées par grands domaines (gouvernance, accès, cryptographie...).",
  },
  {
    id: "C",
    text: "Cette autorité indépendante contrôle le respect de la protection des données à caractère personnel au Maroc.",
    answer: "cndp",
    explanation: "La CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) est l'autorité indépendante marocaine dédiée à ce contrôle.",
  },
  {
    id: "D",
    text: "Ce centre national répond aux incidents de cybersécurité au Maroc et est opéré par l'autorité nationale de cybersécurité.",
    answer: "macert",
    explanation: "Le maCERT est le centre national de réponse aux incidents de cybersécurité, opéré par la DGSSI.",
  },
  {
    id: "E",
    text: "Cette norme internationale de référence structure un système de management de la sécurité de l'information autour d'une approche par les risques, avec possibilité de certification par un organisme indépendant.",
    answer: "iso27001",
    explanation: "ISO/IEC 27001 est la norme internationale de référence pour un système de management de la sécurité de l'information, fondée sur l'identification et le traitement continu des risques.",
  },
  {
    id: "F",
    text: "Ce cadre de référence structure un programme de cybersécurité autour de six grandes fonctions : gouverner, identifier, protéger, détecter, répondre et récupérer.",
    answer: "nistcsf",
    explanation: "Le NIST Cybersecurity Framework organise un programme de cybersécurité autour de ces six fonctions reconnaissables, utilisées bien au-delà des États-Unis où il a été initialement conçu.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module9-qui-fait-quoi",
  title: "Qui Fait Quoi",
  moduleTag: "Module 9 · Lab interactif",
  description:
    "Six descriptions à relier au bon texte légal, à la bonne autorité ou à la bonne norme, parmi le cadre marocain et les standards internationaux vus en cours.",
  participantPitch: "Associez 6 descriptions au bon organisme ou à la bonne norme, en 8 minutes.",
  formateurPitch: "Voyez en direct quels textes ou autorités sont le plus souvent confondus par le groupe.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 6 descriptions sont enregistrées.",

  renderGame(container, pseudo) {
    idx = 0;
    results = [];
    renderScenario(container);
  },

  renderParticipantSummary(container, record) {
    const pct = Math.round((record.score / record.total) * 100);
    const missed = (record.details || []).filter((d) => !d.correct);
    let missedHtml = "";
    if (missed.length > 0) {
      missedHtml = `
        <div class="summary-msg" style="margin-top:14px;">
          <strong>À revoir :</strong> les descriptions ${missed.map((m) => m.id).join(", ")} méritent une relecture — le débrief collectif y reviendra.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} bonnes réponses (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> au Maroc, la DGSSI porte la stratégie et la loi 05-20/DNSSI le cadre technique de la cybersécurité, tandis que la CNDP et la loi 09-08 encadrent spécifiquement les données personnelles — deux chantiers distincts mais complémentaires, chacun avec sa propre autorité de référence.
        </div>
        ${missedHtml}
      </div>
    `;
  },

  participantBadge(record) {
    const pct = Math.round((record.score / record.total) * 100);
    const cls = pct >= 80 ? "low" : pct >= 50 ? "mid" : "high";
    return `<span class="score-chip ${cls}">${record.score}/${record.total}</span>`;
  },

  renderDashboardExtra(container, records) {
    const avgScore = records.reduce((s, r) => s + (r.score || 0), 0) / records.length;
    const perScenario = {};
    SCENARIOS.forEach((s) => (perScenario[s.id] = { correct: 0, total: 0 }));
    records.forEach((r) => {
      (r.details || []).forEach((d) => {
        if (!perScenario[d.id]) return;
        perScenario[d.id].total++;
        if (d.correct) perScenario[d.id].correct++;
      });
    });
    const rows = SCENARIOS.map((s) => {
      const p = perScenario[s.id];
      const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
      return { s, pct, total: p.total };
    }).sort((a, b) => a.pct - b.pct);

    let barsHtml = "";
    rows.forEach((r) => {
      const cls = r.pct >= 80 ? "low" : r.pct >= 50 ? "mid" : "high";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">Description ${r.s.id}<span class="bar-cat">Réponse attendue : ${ENTITY_LABEL[r.s.answer]}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par description — du plus difficile au plus facile</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const s = SCENARIOS.find((x) => x.id === d.id);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;">${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${ENTITY_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${ENTITY_LABEL[s.answer]}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par description</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Description " + s.id,
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === s.id);
        return d ? (d.correct ? "Correct" : "Incorrect (" + ENTITY_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const entityBtnsHtml = ENTITIES.map(
    (e) => `<button class="toggle-btn entity-btn" data-val="${e.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; flex:1 1 40%;">${e.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">DESCRIPTION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:500px; margin:0 auto;">
      <span class="eyebrow">De qui ou de quoi parle-t-on ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      <div class="toggle-row" id="entity-row" style="flex-wrap:wrap; margin-bottom:0;">${entityBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#entity-row .entity-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#entity-row .entity-btn").forEach((x) => {
        const active = x === b;
        x.style.background = active ? "var(--navy)" : "var(--paper)";
        x.style.color = active ? "#fff" : "var(--navy)";
        x.style.borderColor = active ? "var(--navy)" : "#DCD7C8";
      });
      document.getElementById("validate-btn").disabled = false;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = chosen === s.answer;
    results.push({ id: s.id, chosen, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".entity-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + ENTITY_LABEL[s.answer]}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === SCENARIOS.length - 1 ? "Voir mon résultat →" : "Description suivante →"}
      </button>
    `;
    document.getElementById("next-btn").onclick = () => {
      idx++;
      if (idx < SCENARIOS.length) {
        renderScenario(container);
      } else {
        finishGame();
      }
    };
  };
}

function finishGame() {
  const score = results.filter((r) => r.correct).length;
  LabEngine.submitResult({ score, total: SCENARIOS.length, details: results });
}
