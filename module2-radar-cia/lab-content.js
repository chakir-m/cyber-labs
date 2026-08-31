// module2-radar-cia/lab-content.js
//
// Lab 1 du Module 2 : "Classer des incidents selon la triade CIA"
// (Confidentialité / Intégrité / Disponibilité). Comme le Radar des Menaces
// (Module 1), le mécanisme est un quiz avec feedback immédiat, mais ici la
// sélection est MULTIPLE : un incident peut toucher plusieurs piliers à la
// fois (voir le scénario D, volontairement ambigu), la validation compare
// donc un ENSEMBLE de réponses et pas une seule valeur.

const PILLARS = [
  { key: "confidentialite", label: "Confidentialité" },
  { key: "integrite", label: "Intégrité" },
  { key: "disponibilite", label: "Disponibilité" },
];

const SCENARIOS = [
  {
    id: "A",
    text: "Un site web d'e-commerce devient totalement inaccessible pendant six heures suite à une attaque par déni de service.",
    answers: ["disponibilite"],
    explanation: "Le service lui-même devient inaccessible, sans que les données ne soient nécessairement volées ou modifiées — c'est une atteinte à la disponibilité, l'un des trois piliers de la triade CIA.",
  },
  {
    id: "B",
    text: "Un attaquant modifie discrètement les coordonnées bancaires enregistrées pour les virements de salaires d'une entreprise, sans que personne ne s'en aperçoive immédiatement.",
    answers: ["integrite"],
    explanation: "La donnée reste accessible et n'est pas rendue publique, mais elle a été altérée de façon non autorisée — une atteinte à l'intégrité des données.",
  },
  {
    id: "C",
    text: "Une base de données contenant les dossiers médicaux de patients est exposée publiquement suite à une mauvaise configuration d'un serveur cloud.",
    answers: ["confidentialite"],
    explanation: "Les données restent intactes et le service reste disponible, mais elles sont désormais accessibles à des personnes non autorisées — une atteinte à la confidentialité.",
  },
  {
    id: "D",
    text: "Une clé USB contenant des contrats confidentiels est perdue dans les transports en commun.",
    answers: ["confidentialite", "disponibilite"],
    explanation: "Cas volontairement ambigu : le contenu peut être lu par un inconnu (confidentialité) et l'organisation peut aussi perdre l'accès à cette copie si aucune sauvegarde n'existe (disponibilité). Un même incident touche souvent plusieurs piliers à la fois.",
  },
  {
    id: "E",
    text: "Un attaquant modifie frauduleusement le prix affiché d'un produit sur un site marchand avant de passer commande.",
    answers: ["integrite"],
    explanation: "La donnée (le prix) a été altérée sans autorisation — c'est une atteinte à l'intégrité, même si le site reste accessible et que rien n'a « fuité ».",
  },
  {
    id: "F",
    text: "Une attaque par déni de service rend une application bancaire mobile inutilisable pendant une heure.",
    answers: ["disponibilite"],
    explanation: "Comme pour le scénario A, c'est l'accès au service qui est visé, pas le contenu des données — une atteinte à la disponibilité.",
  },
];

let idx = 0;
let results = []; // { id, chosen: [...], correct: bool }

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

window.LabConfig = {
  id: "module2-radar-cia",
  title: "Radar CIA",
  moduleTag: "Module 2 · Lab interactif",
  description:
    "Six incidents à classer selon la triade CIA — Confidentialité, Intégrité, Disponibilité. Attention : certains incidents touchent plusieurs piliers à la fois, cochez toutes les cases qui s'appliquent.",
  participantPitch: "Classez 6 incidents en cochant un ou plusieurs piliers touchés, et obtenez votre score en temps réel.",
  formateurPitch: "Suivez les scores en direct et repérez le pilier ou le scénario le plus souvent mal classé par le groupe.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 6 scénarios sont enregistrées.",

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
          <strong>À revoir :</strong> les scénarios ${missed.map((m) => m.id).join(", ")} méritent une relecture — le débrief collectif y reviendra.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} bonnes réponses (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> un même incident peut toucher plusieurs piliers de la triade CIA à la fois — ne cherchez pas systématiquement une réponse unique, mais tous les piliers réellement affectés.
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
          <div class="bar-label">Scénario ${r.s.id}<span class="bar-cat">${r.s.answers.map((a) => PILLARS.find((p) => p.key === a).label).join(" + ")}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par scénario — du plus difficile au plus facile</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const s = SCENARIOS.find((x) => x.id === d.id);
        const chosenLabels = d.chosen.map((k) => PILLARS.find((p) => p.key === k).label).join(", ") || "aucun";
        const expectedLabels = s.answers.map((k) => PILLARS.find((p) => p.key === k).label).join(", ");
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;">${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${chosenLabels}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${expectedLabels}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par scénario</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Scénario " + s.id,
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === s.id);
        if (!d) return "";
        const chosenLabels = d.chosen.map((k) => PILLARS.find((p) => p.key === k).label).join("+");
        return d.correct ? "Correct" : "Incorrect (" + chosenLabels + ")";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const pillarsHtml = PILLARS.map(
    (p) => `
      <button class="toggle-btn pillar-btn" data-val="${p.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">${p.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SCÉNARIO ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Situation à classer</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:22px;">${LabEngine.escapeHtml(s.text)}</p>

      <div style="margin-bottom:22px;">
        <span class="eyebrow" style="display:block; margin-bottom:8px; color:var(--gray);">Quel(s) pilier(s) de la triade CIA sont touchés ? (une ou plusieurs réponses)</span>
        <div class="toggle-row" id="pillar-row" style="margin-bottom:0;">${pillarsHtml}</div>
      </div>

      <button class="btn-primary" id="validate-btn" disabled>Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  const chosen = new Set();

  container.querySelectorAll("#pillar-row .pillar-btn").forEach((b) => {
    b.onclick = () => {
      const val = b.dataset.val;
      if (chosen.has(val)) {
        chosen.delete(val);
        b.style.background = "var(--paper)";
        b.style.color = "var(--navy)";
      } else {
        chosen.add(val);
        b.style.background = "var(--navy)";
        b.style.color = "#fff";
      }
      document.getElementById("validate-btn").disabled = chosen.size === 0;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const chosenArr = Array.from(chosen);
    const correct = sameSet(chosenArr, s.answers);
    results.push({ id: s.id, chosen: chosenArr, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll("#pillar-row .pillar-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait"}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === SCENARIOS.length - 1 ? "Voir mon résultat →" : "Scénario suivant →"}
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
