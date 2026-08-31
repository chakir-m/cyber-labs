// module1-cartographie-impact/lab-content.js
//
// Lab 3 du Module 1 : "Évaluer l'impact potentiel d'un incident".
// Contenu plus réflexif que les deux précédents labs — le mécanisme choisi
// combine une sélection multiple avec pénalité (identifier les impacts),
// une classification rapide (immédiat / prolongé), et un duel de comparaison
// (le contexte change la gravité). Trois écrans, un score global.

const SCENARIO_TEXT =
  "Une clinique privée de taille moyenne subit une interruption de deux jours de son système de gestion des dossiers patients suite à un incident de sécurité. Pendant cette période, le personnel doit revenir à des procédures papier, certains rendez-vous doivent être reportés, et une partie du personnel administratif est mobilisée à temps plein sur la gestion de la crise plutôt que sur ses tâches habituelles.";

const IMPACT_OPTIONS = [
  { id: "operationnel", label: "Impact opérationnel (interruption de service, rendez-vous reportés)", correct: true },
  { id: "financier", label: "Impact financier (mobilisation de personnel, perte de revenus)", correct: true },
  { id: "reputationnel", label: "Impact réputationnel (confiance des patients)", correct: true },
  { id: "humain", label: "Impact humain ou sanitaire (retard de soins, erreurs de procédure dégradée)", correct: true },
  { id: "environnemental", label: "Impact environnemental (pollution, biodiversité)", correct: false },
  { id: "aucun", label: "Aucun impact réel au-delà du coût technique de réparation", correct: false },
];

const CLASSIFY_ITEMS = [
  { id: "c1", text: "Le service de gestion des dossiers patients est inaccessible pendant les deux jours de l'incident.", answer: "immediat" },
  { id: "c2", text: "Plusieurs patients, inquiets, choisissent de changer d'établissement dans les mois qui suivent.", answer: "prolonge" },
  { id: "c3", text: "Le personnel administratif est mobilisé à temps plein sur la gestion de la crise pendant l'incident.", answer: "immediat" },
  { id: "c4", text: "La clinique doit revoir et renforcer ses procédures de sécurité, un chantier qui s'étale sur plusieurs mois.", answer: "prolonge" },
];

const DUEL = {
  question: "À durée d'interruption égale (deux jours), lequel de ces deux incidents aurait probablement les conséquences les plus graves ?",
  optionA: { id: "clinique", label: "Une clinique médicale ne peut plus accéder aux dossiers patients" },
  optionB: { id: "deco", label: "Une boutique en ligne d'articles de décoration ne peut plus traiter les commandes" },
  correct: "clinique",
  explanation: "Un retard de soins ou une erreur dans un dossier médical peut avoir des conséquences directes sur la santé des patients, contrairement à un retard de livraison d'articles de décoration — la nature de l'activité influence directement la gravité potentielle d'un même type d'incident, indépendamment de sa durée.",
};

let selectedImpacts = [];
let classifyIdx = 0;
let classifyAnswers = [];
let duelAnswer = null;

window.LabConfig = {
  id: "module1-cartographie-impact",
  title: "Cartographie d'Impact",
  moduleTag: "Module 1 · Lab interactif",
  description:
    "Un incident de sécurité coûte rarement cher pour une seule raison. Identifiez les impacts d'un scénario réel, classez-les dans le temps, puis comparez deux secteurs pour comprendre pourquoi le contexte change tout.",
  participantPitch: "Trois courtes étapes pour apprendre à évaluer l'impact réel d'un incident, au-delà du seul coût technique.",
  formateurPitch: "Repérez collectivement les impacts les plus souvent oubliés par le groupe, pour orienter votre débrief.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux trois étapes sont enregistrées.",

  renderGame(container, pseudo) {
    selectedImpacts = [];
    classifyIdx = 0;
    classifyAnswers = [];
    duelAnswer = null;
    renderStep1(container);
  },

  renderParticipantSummary(container, record) {
    const pct = Math.round((record.totalScore / record.maxScore) * 100);
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.totalScore}<span class="unit">/ ${record.maxScore} points (${pct}%)</span></div>
        <div class="mini-stats">
          <div class="mini-stat low"><div class="n">${record.impactScore}/4</div><div class="l">IMPACTS TROUVÉS</div></div>
          <div class="mini-stat mid"><div class="n">${record.classifyScore}/4</div><div class="l">CLASSEMENT TEMPS</div></div>
          <div class="mini-stat high"><div class="n">${record.duelCorrect ? "1" : "0"}/1</div><div class="l">DUEL SECTEUR</div></div>
        </div>
        <div class="summary-msg">
          <strong>À retenir :</strong> un même type d'incident (deux jours d'interruption) peut avoir une gravité très différente selon le secteur d'activité — l'évaluation d'un risque ne se limite jamais au seul coût technique de réparation, et doit toujours être mise en contexte.
        </div>
      </div>
    `;
  },

  participantBadge(record) {
    const pct = Math.round((record.totalScore / record.maxScore) * 100);
    const cls = pct >= 75 ? "low" : pct >= 45 ? "mid" : "high";
    return `<span class="score-chip ${cls}">${record.totalScore}/${record.maxScore}</span>`;
  },

  renderDashboardExtra(container, records) {
    const avg = records.reduce((s, r) => s + (r.totalScore || 0), 0) / records.length;
    const maxScore = records[0] ? records[0].maxScore : 9;

    // Impacts les plus souvent manqués
    const missCounts = {};
    IMPACT_OPTIONS.filter((o) => o.correct).forEach((o) => (missCounts[o.id] = 0));
    records.forEach((r) => {
      IMPACT_OPTIONS.filter((o) => o.correct).forEach((o) => {
        if (!(r.selectedImpacts || []).includes(o.id)) missCounts[o.id]++;
      });
    });
    const missRows = Object.entries(missCounts)
      .map(([id, count]) => {
        const opt = IMPACT_OPTIONS.find((o) => o.id === id);
        const pct = Math.round((count / records.length) * 100);
        return { opt, pct };
      })
      .sort((a, b) => b.pct - a.pct);

    let barsHtml = "";
    missRows.forEach((r) => {
      const cls = r.pct >= 50 ? "high" : r.pct >= 20 ? "mid" : "low";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">${LabEngine.escapeHtml(r.opt.label)}</div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.pct}%</div>
        </div>`;
    });

    const duelPct = Math.round((records.filter((r) => r.duelCorrect).length / records.length) * 100);

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avg.toFixed(1)} / ${maxScore}</div><div class="l">Score moyen du groupe</div></div>
        <div class="stat-card"><div class="n">${duelPct}%</div><div class="l">Ont identifié le secteur le plus grave</div></div>
      </div>
      <div class="section-title">Impacts les plus souvent oubliés par le groupe</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const impactRows = IMPACT_OPTIONS.map((o) => {
      const selected = (record.selectedImpacts || []).includes(o.id);
      const ok = selected === o.correct;
      return `<div style="display:flex; align-items:center; gap:8px; padding:5px 0; font-size:12.5px;">
        <span class="score-chip ${ok ? "low" : "high"}" style="min-width:24px;">${ok ? "✓" : "✗"}</span>
        <span style="flex:1; color:${selected ? "var(--ink)" : "var(--gray)"};">${selected ? "●" : "○"} ${LabEngine.escapeHtml(o.label)}</span>
      </div>`;
    }).join("");

    const classifyRows = (record.classifyAnswers || []).map((a) => {
      const item = CLASSIFY_ITEMS.find((c) => c.id === a.id);
      const ok = a.chosen === item.answer;
      return `<div style="padding:8px 0; border-bottom:1px solid #EDEAE0;">
        <div style="font-size:12px; color:var(--ink); margin-bottom:4px;">${LabEngine.escapeHtml(item.text)}</div>
        <span class="score-chip ${ok ? "low" : "high"}">${ok ? "✓ Correct" : "✗ Réponse : " + a.chosen}</span>
      </div>`;
    }).join("");

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.totalScore} / ${record.maxScore}</div><div class="l">Score total</div></div>
      </div>
      <div class="section-title">Étape 1 — Impacts identifiés</div>
      <div>${impactRows}</div>
      <div class="section-title">Étape 2 — Immédiat ou prolongé ?</div>
      <div>${classifyRows}</div>
      <div class="section-title">Étape 3 — Duel de secteur</div>
      <div style="font-size:12.5px;">
        <span class="score-chip ${record.duelCorrect ? "low" : "high"}">${record.duelCorrect ? "✓ Correct" : "✗ Incorrect"}</span>
        — réponse donnée : ${record.duelAnswer === "clinique" ? DUEL.optionA.label : DUEL.optionB.label}
      </div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score total", get: (r) => (r.totalScore || 0) + "/" + (r.maxScore || 0) },
    { header: "Impacts trouvés", get: (r) => (r.impactScore || 0) + "/4" },
    { header: "Classement temps", get: (r) => (r.classifyScore || 0) + "/4" },
    { header: "Duel secteur", get: (r) => (r.duelCorrect ? "Correct" : "Incorrect") },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
  ],
};

/* ============ Étape 1 — Sélection multiple des impacts ============ */
function renderStep1(container) {
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
      <div class="progress-label">ÉTAPE 1 / 3 — IDENTIFIER LES IMPACTS</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Mise en situation</span>
      <p class="desc" style="font-size:14px; color:var(--ink); margin-bottom:18px;">${LabEngine.escapeHtml(SCENARIO_TEXT)}</p>
      <span class="eyebrow" style="display:block; margin-bottom:10px; color:var(--gray);">Cochez tous les impacts que vous identifiez :</span>
      <div id="impact-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
        ${IMPACT_OPTIONS.map(
          (o) => `
          <button class="toggle-btn impact-opt" data-id="${o.id}" style="text-align:left; background:var(--paper); color:var(--ink); border:1.5px solid #DCD7C8; padding:12px 14px;">
            ${LabEngine.escapeHtml(o.label)}
          </button>`
        ).join("")}
      </div>
      <button class="btn-primary" id="step1-next">Valider mes choix →</button>
    </div>
  `;
  container.querySelectorAll(".impact-opt").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.id;
      const i = selectedImpacts.indexOf(id);
      if (i === -1) {
        selectedImpacts.push(id);
        b.style.background = "var(--navy)";
        b.style.color = "#fff";
        b.style.borderColor = "var(--navy)";
      } else {
        selectedImpacts.splice(i, 1);
        b.style.background = "var(--paper)";
        b.style.color = "var(--ink)";
        b.style.borderColor = "#DCD7C8";
      }
    };
  });
  document.getElementById("step1-next").onclick = () => renderStep2(container);
}

/* ============ Étape 2 — Immédiat ou prolongé ============ */
function renderClassifyCard(container) {
  const item = CLASSIFY_ITEMS[classifyIdx];
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${33 + (classifyIdx / CLASSIFY_ITEMS.length) * 33}%"></div></div>
      <div class="progress-label">ÉTAPE 2 / 3 — IMMÉDIAT OU PROLONGÉ (${classifyIdx + 1}/${CLASSIFY_ITEMS.length})</div>
    </div>
    <div class="card-shell fade-in" style="max-width:460px; margin:0 auto; text-align:center;">
      <span class="eyebrow">Cet impact est plutôt…</span>
      <p class="desc" style="font-size:14.5px; color:var(--ink); margin:14px 0 22px;">${LabEngine.escapeHtml(item.text)}</p>
      <div style="display:flex; gap:10px;">
        <button class="btn-ghost" id="btn-immediat" style="flex:1; padding:16px;">⚡ Immédiat</button>
        <button class="btn-ghost" id="btn-prolonge" style="flex:1; padding:16px;">⏳ Prolongé</button>
      </div>
    </div>
  `;
  const choose = (val) => {
    classifyAnswers.push({ id: item.id, chosen: val });
    classifyIdx++;
    if (classifyIdx < CLASSIFY_ITEMS.length) {
      renderClassifyCard(container);
    } else {
      renderStep3(container);
    }
  };
  document.getElementById("btn-immediat").onclick = () => choose("immediat");
  document.getElementById("btn-prolonge").onclick = () => choose("prolonge");
}
function renderStep2(container) {
  classifyIdx = 0;
  classifyAnswers = [];
  renderClassifyCard(container);
}

/* ============ Étape 3 — Duel de comparaison ============ */
function renderStep3(container) {
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:75%"></div></div>
      <div class="progress-label">ÉTAPE 3 / 3 — LE DUEL DES SECTEURS</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto; text-align:center;">
      <span class="eyebrow">Question finale</span>
      <p class="desc" style="font-size:14.5px; color:var(--ink); margin:14px 0 20px;">${LabEngine.escapeHtml(DUEL.question)}</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="role-card participant" id="duel-a" style="padding:16px 18px;">
          <div class="role-glyph">A</div>
          <div class="role-title" style="font-size:14.5px; text-align:left;">${LabEngine.escapeHtml(DUEL.optionA.label)}</div>
        </button>
        <button class="role-card formateur" id="duel-b" style="padding:16px 18px;">
          <div class="role-glyph">B</div>
          <div class="role-title" style="font-size:14.5px; text-align:left;">${LabEngine.escapeHtml(DUEL.optionB.label)}</div>
        </button>
      </div>
    </div>
  `;
  document.getElementById("duel-a").onclick = () => { duelAnswer = "clinique"; finishGame(); };
  document.getElementById("duel-b").onclick = () => { duelAnswer = "deco"; finishGame(); };
}

/* ============ Calcul final ============ */
function finishGame() {
  const impactScore = IMPACT_OPTIONS.reduce((s, o) => {
    const selected = selectedImpacts.includes(o.id);
    if (o.correct && selected) return s + 1;
    if (!o.correct && selected) return s - 1;
    return s;
  }, 0);
  const clampedImpactScore = Math.max(0, Math.min(4, impactScore));

  const classifyScore = classifyAnswers.filter((a) => {
    const item = CLASSIFY_ITEMS.find((c) => c.id === a.id);
    return item.answer === a.chosen;
  }).length;

  const duelCorrect = duelAnswer === DUEL.correct;
  const totalScore = clampedImpactScore + classifyScore + (duelCorrect ? 1 : 0);
  const maxScore = 4 + 4 + 1;

  LabEngine.submitResult({
    impactScore: clampedImpactScore,
    classifyScore,
    duelCorrect,
    duelAnswer,
    totalScore,
    maxScore,
    selectedImpacts: [...selectedImpacts],
    classifyAnswers: [...classifyAnswers],
  });
}
