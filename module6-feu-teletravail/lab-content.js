// module6-feu-teletravail/lab-content.js
//
// Lab 2 du Module 6 : "Identifier les risques du télétravail à domicile".
// Quatre situations domestiques à évaluer sur l'échelle à 3 niveaux déjà
// utilisée au Module 3 (Faible / Modéré / Élevé) — y compris une "bonne
// pratique" notée Faible, pour rappeler que l'échelle sert aussi à valoriser
// les bons réflexes, pas seulement à repérer les dangers.

const TIERS = [
  { key: "faible", label: "🟢 Risque faible", emoji: "FAIBLE", color: "var(--low)" },
  { key: "modere", label: "🟠 Risque modéré", emoji: "MOYEN", color: "var(--mid)" },
  { key: "eleve", label: "🔴 Risque élevé", emoji: "ÉLEVÉ", color: "var(--high)" },
];
const TIER_LABEL = Object.fromEntries(TIERS.map((t) => [t.key, t.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Le routeur Wi-Fi domestique utilise encore le mot de passe administrateur défini en usine, jamais modifié depuis l'installation trois ans plus tôt.",
    accepted: ["eleve"],
    verdict: "Risque élevé",
    explanation: "Un mot de passe administrateur par défaut est largement connu et documenté publiquement, ce qui en fait une vulnérabilité de premier plan pour l'ensemble du réseau domestique, y compris les appareils professionnels qui s'y connectent.",
  },
  {
    id: "B",
    text: "Un enfant utilise ponctuellement l'ordinateur professionnel du parent en télétravail pour regarder une vidéo pendant une pause déjeuner.",
    accepted: ["eleve"],
    verdict: "Risque élevé",
    explanation: "La règle est sans exception : un appareil professionnel doit rester strictement réservé à un usage professionnel, y compris à domicile, quelle que soit la brièveté de l'usage annexe — un seul clic malheureux suffit à compromettre l'appareil.",
  },
  {
    id: "C",
    text: "Le collaborateur verrouille systématiquement son ordinateur professionnel dès qu'il s'en éloigne, même pour quelques minutes, y compris à domicile.",
    accepted: ["faible"],
    verdict: "Risque faible (bonne pratique)",
    explanation: "Ce comportement applique exactement le réflexe recommandé : les règles habituelles du bureau s'appliquent intégralement au télétravail, même en l'absence apparente de risque immédiat à domicile.",
  },
  {
    id: "D",
    text: "Les objets connectés domestiques (télévision connectée, assistant vocal) partagent le même réseau Wi-Fi que l'ordinateur professionnel utilisé en télétravail.",
    accepted: ["modere", "eleve"],
    verdict: "Risque modéré à élevé",
    explanation: "Il est recommandé d'isoler, si possible, les objets connectés domestiques du réseau utilisé pour le travail, car ils sont souvent moins sécurisés et peuvent servir de point d'entrée vers l'ensemble du réseau.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module6-feu-teletravail",
  title: "Feu du Télétravail",
  moduleTag: "Module 6 · Lab interactif",
  description:
    "Quatre situations à domicile, un niveau de risque à trouver : Faible, Modéré ou Élevé. Un bon réflexe compte aussi, pas seulement un danger.",
  participantPitch: "Évaluez le niveau de risque de 4 situations de télétravail en moins de 6 minutes.",
  formateurPitch: "Repérez en direct la situation la plus souvent mal évaluée par le groupe.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 4 situations sont enregistrées.",

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
          <strong>À revoir :</strong> les situations ${missed.map((m) => m.id).join(", ")} méritent une relecture — le débrief collectif y reviendra.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} bonnes réponses (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> les règles habituelles du bureau s'appliquent intégralement au télétravail — un appareil professionnel réservé à un usage strictement professionnel et verrouillé systématiquement reste le socle, quel que soit le confort apparent du domicile.
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
          <div class="bar-label">Situation ${r.s.id}<span class="bar-cat">${r.s.verdict}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par situation — du plus difficile au plus facile</div>
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
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${TIER_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${s.verdict}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par situation</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Situation " + s.id,
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === s.id);
        return d ? (d.correct ? "Correct" : "Incorrect (" + TIER_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SITUATION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Quel niveau de risque ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:16px;">${LabEngine.escapeHtml(s.text)}</p>
      ${LabEngine.gaugeMarkup(TIERS)}
      <p class="desc" style="font-size:12px; color:var(--gray); text-align:center; margin-top:8px;">👆 Touchez la zone du cadran correspondant à votre estimation</p>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:14px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  LabEngine.bindGauge(container, TIERS, (key) => {
    chosen = key;
    document.getElementById("validate-btn").disabled = false;
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = s.accepted.includes(chosen);
    results.push({ id: s.id, chosen, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".gauge-zone").forEach((el) => (el.style.pointerEvents = "none"));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait"} — ${s.verdict}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === SCENARIOS.length - 1 ? "Voir mon résultat →" : "Situation suivante →"}
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
