// module2-grille-risque/lab-content.js
//
// Lab 2 du Module 2 : "Évaluer le risque de 3 scénarios" en appliquant la
// formule Risque = Menace x Vulnérabilité x Impact (échelle 1-3 par facteur,
// vue en démonstration guidée sur la slide M2-S23).
//
// Deux temps de jeu, contrairement aux labs précédents :
//   1) Pour chacun des 3 scénarios, le participant estime Menace/Vulnérabilité/
//      Impact et voit immédiatement si le NIVEAU DE RISQUE global (Faible/
//      Moyen/Élevé) qu'il obtient correspond à l'estimation experte — on ne
//      juge pas les 3 facteurs isolément (l'estimation individuelle reste
//      subjective), seul le niveau final compte.
//   2) Le participant classe ensuite les 3 scénarios du plus au moins
//      prioritaire — la compétence réellement visée par cet atelier.
// Score final = points de niveau (0-3) + points de classement (0-3) = /6.

const SCENARIOS = [
  {
    id: "S1",
    label: "Mot de passe administrateur",
    text: "Le mot de passe du compte administrateur est resté identique depuis cinq ans, sans jamais avoir été changé.",
    expert: { m: 3, v: 3, i: 3 },
    priority: 1, // du plus (1) au moins (3) urgent
    explanation: "Une menace très fréquente (les mots de passe administrateurs sont des cibles privilégiées), une vulnérabilité maximale (un mot de passe jamais renouvelé pendant cinq ans a de fortes chances d'avoir fuité ou d'être devenu prévisible), et un impact potentiellement total puisqu'un accès administrateur ouvre les portes de l'ensemble du système. C'est le scénario le plus prioritaire des trois.",
  },
  {
    id: "S2",
    label: "Fenêtre de bureau visible",
    text: "Une fenêtre de bureau est visible depuis la rue, avec un écran déverrouillé en permanence pendant les heures de travail.",
    expert: { m: 2, v: 3, i: 2 },
    priority: 2,
    explanation: "La menace suppose la présence physique d'un passant curieux ou malveillant — moins systématique qu'une attaque à distance. La vulnérabilité reste élevée (rien n'empêche de lire l'écran), mais l'impact est généralement limité à ce qui est visible à un instant donné, pas à un accès complet et durable au système.",
  },
  {
    id: "S3",
    label: "Logiciel métier isolé",
    text: "Un logiciel métier n'a pas été mis à jour depuis deux ans, mais il fonctionne sur un poste totalement isolé du réseau internet.",
    expert: { m: 1, v: 3, i: 2 },
    priority: 3,
    explanation: "La vulnérabilité technique est réelle (deux ans sans correctif), mais l'isolement réseau réduit fortement la probabilité qu'une menace externe puisse l'exploiter — c'est un bon exemple de mesure compensatoire qui abaisse le risque global malgré une vulnérabilité élevée. C'est le scénario le moins prioritaire des trois, précisément parce que la menace est très faible.",
  },
];

function tierOf(score) {
  if (score <= 6) return "faible";
  if (score <= 14) return "moyen";
  return "eleve";
}
const TIER_LABEL = { faible: "Faible", moyen: "Moyen", eleve: "Élevé" };

let step = "estimate"; // "estimate" | "rank"
let sIdx = 0;
let estimateResults = []; // { id, m, v, i, score, tier, tierMatch }
let rankOrder = []; // ids clicked in order by the participant

window.LabConfig = {
  id: "module2-grille-risque",
  title: "Grille de Risque",
  moduleTag: "Module 2 · Lab interactif",
  description:
    "Estimez Menace, Vulnérabilité et Impact pour trois situations réelles, puis classez-les du plus au moins prioritaire — la compétence clé de cet atelier.",
  participantPitch: "Évaluez 3 scénarios (M×V×I) puis classez-les par ordre de priorité, en environ 8 minutes.",
  formateurPitch: "Comparez les niveaux de risque estimés par le groupe à l'estimation experte, et voyez si le classement final est bien maîtrisé.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos estimations et votre classement sont enregistrés.",

  renderGame(container, pseudo) {
    step = "estimate";
    sIdx = 0;
    estimateResults = [];
    rankOrder = [];
    renderEstimateScreen(container);
  },

  renderParticipantSummary(container, record) {
    const tierPts = record.details.estimates.filter((e) => e.tierMatch).length;
    const rankPts = record.details.rankPositionsCorrect;
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} points</span></div>
        <p class="summary-sub">Niveaux de risque correctement estimés : ${tierPts}/3 · Scénarios bien classés : ${rankPts}/3</p>
        <div class="summary-msg">
          <strong>À retenir :</strong> un risque élevé ne vient pas seulement d'une vulnérabilité forte — sans menace réaliste pour l'exploiter (scénario du logiciel isolé), le risque global reste contenu. C'est la combinaison des trois facteurs, jamais un seul isolément, qui détermine la priorité d'action.
        </div>
      </div>
    `;
  },

  participantBadge(record) {
    const pct = Math.round((record.score / record.total) * 100);
    const cls = pct >= 80 ? "low" : pct >= 50 ? "mid" : "high";
    return `<span class="score-chip ${cls}">${record.score}/${record.total}</span>`;
  },

  renderDashboardExtra(container, records) {
    const avg = records.reduce((s, r) => s + (r.score || 0), 0) / records.length;
    const perScenario = {};
    SCENARIOS.forEach((s) => (perScenario[s.id] = { match: 0, total: 0 }));
    let rankFullMatch = 0;
    records.forEach((r) => {
      (r.details.estimates || []).forEach((e) => {
        if (!perScenario[e.id]) return;
        perScenario[e.id].total++;
        if (e.tierMatch) perScenario[e.id].match++;
      });
      if (r.details.rankPositionsCorrect === 3) rankFullMatch++;
    });
    const rows = SCENARIOS.map((s) => {
      const p = perScenario[s.id];
      const pct = p.total > 0 ? Math.round((p.match / p.total) * 100) : 0;
      return { s, pct, total: p.total };
    }).sort((a, b) => a.pct - b.pct);

    let barsHtml = "";
    rows.forEach((r) => {
      const cls = r.pct >= 80 ? "low" : r.pct >= 50 ? "mid" : "high";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">${r.s.label}<span class="bar-cat">Niveau expert : ${TIER_LABEL[tierOf(r.s.expert.m * r.s.expert.v * r.s.expert.i)]}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    const rankPct = records.length > 0 ? Math.round((rankFullMatch / records.length) * 100) : 0;

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avg.toFixed(1)} / 6</div><div class="l">Score moyen du groupe</div></div>
        <div class="stat-card"><div class="n">${rankPct}%</div><div class="l">Classement final entièrement correct</div></div>
      </div>
      <div class="section-title">Niveau de risque correctement estimé, par scénario</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = record.details.estimates
      .map((e) => {
        const s = SCENARIOS.find((x) => x.id === e.id);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;"><strong>${LabEngine.escapeHtml(s.label)}</strong> — ${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${e.tierMatch ? "low" : "high"}">${e.tierMatch ? "✓ Niveau correct" : "✗ Niveau différent"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Estimé : M${e.m} V${e.v} I${e.i} → ${TIER_LABEL[e.tier]}</span>
            ${!e.tierMatch ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Expert : ${TIER_LABEL[tierOf(s.expert.m * s.expert.v * s.expert.i)]}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    const rankRow = record.details.rankOrder
      .map((id, i) => {
        const s = SCENARIOS.find((x) => x.id === id);
        const ok = s.priority === i + 1;
        return `<span class="score-chip ${ok ? "low" : "high"}">${i + 1}. ${s.label}</span>`;
      })
      .join(" ");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Niveaux de risque estimés</div>
      <div>${rows}</div>
      <div class="section-title">Classement soumis (du plus au moins prioritaire)</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; padding:8px 0;">${rankRow}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Niveau " + s.label,
      get: (r) => {
        const e = (r.details.estimates || []).find((x) => x.id === s.id);
        return e ? TIER_LABEL[e.tier] + (e.tierMatch ? " (correct)" : " (attendu: " + TIER_LABEL[tierOf(s.expert.m * s.expert.v * s.expert.i)] + ")") : "";
      },
    })),
    { header: "Classement soumis", get: (r) => r.details.rankOrder.map((id) => SCENARIOS.find((s) => s.id === id).label).join(" > ") },
    { header: "Positions correctes", get: (r) => r.details.rankPositionsCorrect + "/3" },
  ],
};

/* ============ Étape 1 : estimation M/V/I par scénario ============ */
function factorRow(label, name) {
  return `
    <div style="margin-bottom:16px;">
      <span class="eyebrow" style="display:block; margin-bottom:8px; color:var(--gray);">${label}</span>
      <div class="sens-row" id="row-${name}">
        <button class="sens-btn" data-lvl="1">FAIBLE (1)</button>
        <button class="sens-btn" data-lvl="2">MOYEN (2)</button>
        <button class="sens-btn" data-lvl="3">ÉLEVÉ (3)</button>
      </div>
    </div>`;
}

function renderEstimateScreen(container) {
  const s = SCENARIOS[sIdx];
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(sIdx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SCÉNARIO ${sIdx + 1} / ${SCENARIOS.length} — ESTIMATION</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">${LabEngine.escapeHtml(s.label)}</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      ${factorRow("Menace — probabilité que cette situation soit exploitée", "m")}
      ${factorRow("Vulnérabilité — facilité d'exploitation si la menace se présente", "v")}
      ${factorRow("Impact — gravité des conséquences si l'incident se produit", "i")}
      <button class="btn-primary" id="validate-btn" disabled>Calculer le niveau de risque</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  const chosen = { m: null, v: null, i: null };
  ["m", "v", "i"].forEach((name) => {
    container.querySelectorAll(`#row-${name} .sens-btn`).forEach((b) => {
      b.onclick = () => {
        chosen[name] = parseInt(b.dataset.lvl, 10);
        container.querySelectorAll(`#row-${name} .sens-btn`).forEach((x) => x.classList.toggle("active", x === b));
        document.getElementById("validate-btn").disabled = !(chosen.m && chosen.v && chosen.i);
      };
    });
  });

  document.getElementById("validate-btn").onclick = () => {
    const score = chosen.m * chosen.v * chosen.i;
    const tier = tierOf(score);
    const expertScore = s.expert.m * s.expert.v * s.expert.i;
    const expertTier = tierOf(expertScore);
    const tierMatch = tier === expertTier;
    estimateResults.push({ id: s.id, m: chosen.m, v: chosen.v, i: chosen.i, score, tier, tierMatch });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".sens-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${tierMatch ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${tierMatch ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          Votre niveau : ${TIER_LABEL[tier]} (${score}/27) — ${tierMatch ? "identique à l'estimation experte ✓" : "l'estimation experte est " + TIER_LABEL[expertTier]}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${sIdx === SCENARIOS.length - 1 ? "Passer au classement final →" : "Scénario suivant →"}
      </button>
    `;
    document.getElementById("next-btn").onclick = () => {
      sIdx++;
      if (sIdx < SCENARIOS.length) {
        renderEstimateScreen(container);
      } else {
        step = "rank";
        renderRankScreen(container);
      }
    };
  };
}

/* ============ Étape 2 : classement par priorité ============ */
function renderRankScreen(container) {
  rankOrder = [];
  const cardsHtml = SCENARIOS.map(
    (s) => `
      <button class="role-card participant" style="text-align:left;" data-id="${s.id}" id="rank-${s.id}">
        <div class="role-glyph" id="rank-glyph-${s.id}">?</div>
        <div>
          <div class="role-title" style="font-size:16px;">${LabEngine.escapeHtml(s.label)}</div>
          <div class="role-sub">${LabEngine.escapeHtml(s.text)}</div>
        </div>
      </button>`
  ).join("");

  container.innerHTML = `
    <div class="card-shell fade-in" style="max-width:520px; margin:0 auto;">
      <span class="eyebrow">Classement final</span>
      <h2 style="font-size:22px;">Du plus au moins prioritaire</h2>
      <p class="desc">Cliquez sur les trois scénarios dans l'ordre : le premier clic devient la priorité n°1 (la plus urgente à traiter), le dernier la priorité n°3.</p>
      <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">${cardsHtml}</div>
      <div id="rank-feedback" style="margin-top:16px;"></div>
    </div>
  `;

  SCENARIOS.forEach((s) => {
    document.getElementById(`rank-${s.id}`).onclick = () => {
      if (rankOrder.includes(s.id)) return;
      rankOrder.push(s.id);
      document.getElementById(`rank-glyph-${s.id}`).textContent = rankOrder.length;
      document.getElementById(`rank-${s.id}`).style.opacity = "0.55";
      document.getElementById(`rank-${s.id}`).style.borderColor = "var(--gold)";
      if (rankOrder.length === SCENARIOS.length) {
        finishGame(container);
      }
    };
  });
}

function finishGame(container) {
  const positionsCorrect = rankOrder.filter((id, i) => SCENARIOS.find((s) => s.id === id).priority === i + 1).length;
  const tierPoints = estimateResults.filter((e) => e.tierMatch).length;
  const score = tierPoints + positionsCorrect;

  const zone = document.getElementById("rank-feedback");
  const expertOrder = [...SCENARIOS].sort((a, b) => a.priority - b.priority).map((s) => s.label);
  if (zone) {
    zone.innerHTML = `
      <div style="background:${positionsCorrect === 3 ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${positionsCorrect === 3 ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${positionsCorrect}/3 scénarios bien placés
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">Ordre expert : ${expertOrder.join(" → ")}</div>
      </div>
    `;
  }

  setTimeout(() => {
    LabEngine.submitResult({
      score,
      total: 6,
      details: {
        estimates: estimateResults,
        rankOrder: [...rankOrder],
        rankPositionsCorrect: positionsCorrect,
      },
    });
  }, 1400);
}
