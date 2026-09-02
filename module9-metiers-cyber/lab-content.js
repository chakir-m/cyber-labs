// module9-metiers-cyber/lab-content.js
//
// Lab 2 du Module 9 : "Associez un métier à sa mission" — quatre
// descriptions à relier au bon métier de la cybersécurité (RSSI, analyste
// SOC, testeur d'intrusion, consultant GRC). Choix unique, feedback
// immédiat. Le piège pédagogique ciblé : la confusion entre consultant GRC
// et RSSI, tous deux liés à la gouvernance mais avec un positionnement très
// différent (accompagnement externe vs responsabilité stratégique interne).

const METIERS = [
  { key: "rssi", label: "RSSI", icon: "👔" },
  { key: "soc", label: "Analyste SOC", icon: "🖥️" },
  { key: "pentester", label: "Testeur d'intrusion (pentester)", icon: "🎯" },
  { key: "grc", label: "Consultant GRC", icon: "📊" },
];
const METIER_LABEL = Object.fromEntries(METIERS.map((m) => [m.key, m.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Cette personne est mandatée, dans un cadre contractuel strict, pour tenter de s'introduire dans les systèmes de l'entreprise afin d'identifier des vulnérabilités avant un attaquant réel.",
    answer: "pentester",
    explanation: "L'autorisation contractuelle explicite pour simuler une attaque réelle est la signature du testeur d'intrusion — la différence avec un attaquant n'est pas technique mais légale.",
  },
  {
    id: "B",
    text: "Cette personne surveille en continu les alertes de sécurité générées par les outils de détection, et distingue les incidents réels des fausses alertes.",
    answer: "soc",
    explanation: "La surveillance continue et le tri des alertes constituent le cœur du métier d'analyste SOC, qui travaille souvent en horaires décalés puisque le SOC fonctionne généralement en continu.",
  },
  {
    id: "C",
    text: "Cette personne accompagne une entreprise dans sa mise en conformité à la DNSSI et à ISO 27001, sans nécessairement configurer elle-même les outils techniques.",
    answer: "grc",
    explanation: "L'accompagnement à la conformité réglementaire et normative, avec une compétence davantage organisationnelle que technique, correspond au consultant GRC (Gouvernance, Risque, Conformité).",
  },
  {
    id: "D",
    text: "Cette personne définit la stratégie de sécurité globale de l'organisation et rend compte régulièrement à la direction générale de l'état des risques.",
    answer: "rssi",
    explanation: "Le pilotage stratégique et le reporting à la direction générale sont les missions centrales du RSSI, qui porte la responsabilité en interne — contrairement au consultant GRC, qui accompagne souvent depuis l'extérieur ou en support.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module9-metiers-cyber",
  title: "Métiers de la Cybersécurité",
  moduleTag: "Module 9 · Lab interactif",
  description:
    "Quatre descriptions de mission, un métier à identifier parmi RSSI, analyste SOC, testeur d'intrusion et consultant GRC.",
  participantPitch: "Identifiez le bon métier pour 4 descriptions de mission, en 6 minutes.",
  formateurPitch: "Repérez en direct la confusion la plus fréquente — souvent RSSI et consultant GRC.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 4 descriptions sont enregistrées.",

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
          <strong>À retenir :</strong> le consultant GRC accompagne souvent depuis l'extérieur ou en support, tandis que le RSSI porte la responsabilité stratégique de la sécurité en interne et en rend compte à la direction — une nuance de positionnement plus que de compétence.
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
          <div class="bar-label">Description ${r.s.id}<span class="bar-cat">Réponse attendue : ${METIER_LABEL[r.s.answer]}</span></div>
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
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${METIER_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${METIER_LABEL[s.answer]}</span>` : ""}
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
        return d ? (d.correct ? "Correct" : "Incorrect (" + METIER_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const metierCardsHtml = METIERS.map(
    (m) => `
      <button class="metier-btn card-choice-row" data-val="${m.key}" style="display:flex; align-items:center; gap:14px; width:100%; text-align:left; background:#fff; border:1.5px solid #E4E0D5; border-radius:12px; padding:14px 16px; transition:border-color .15s ease, background .15s ease;">
        <span style="font-size:24px; flex:none;">${m.icon}</span>
        <span class="card-choice-label" style="font-size:14px; font-weight:600; color:var(--navy);">${m.label}</span>
      </button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">DESCRIPTION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:500px; margin:0 auto;">
      <span class="eyebrow">Quel métier de la cybersécurité ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      <div id="metier-row" style="display:flex; flex-direction:column; gap:10px; margin-bottom:0;">${metierCardsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
    <style>
      .card-choice-row:hover{ border-color:var(--gold) !important; }
      .card-choice-row.selected{ background:var(--navy) !important; border-color:var(--navy) !important; }
      .card-choice-row.selected .card-choice-label{ color:#fff !important; }
    </style>
  `;

  let chosen = null;
  container.querySelectorAll("#metier-row .metier-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#metier-row .metier-btn").forEach((x) => x.classList.toggle("selected", x === b));
      document.getElementById("validate-btn").disabled = false;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = chosen === s.answer;
    results.push({ id: s.id, chosen, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".metier-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + METIER_LABEL[s.answer]}
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
