// module5-coffre-mots-passe/lab-content.js
//
// Lab 1 du Module 5 : "Évaluez la robustesse de ces mots de passe". Quatre
// mots de passe (ou méthodes) à classer sur une échelle à 4 niveaux : Faible,
// Correct, Robuste, Très robuste. Choix unique par situation, feedback
// immédiat. Le point pédagogique clé : la longueur et l'imprévisibilité
// comptent plus que la présence de symboles ou de substitutions visuelles.

const LEVELS = [
  { key: "faible", label: "Faible" },
  { key: "correct", label: "Correct" },
  { key: "robuste", label: "Robuste" },
  { key: "tresrobuste", label: "Très robuste" },
];
const LEVEL_LABEL = Object.fromEntries(LEVELS.map((l) => [l.key, l.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Sophie2024!",
    answer: "faible",
    explanation: "Combine un mot du dictionnaire (prénom) et une année — un schéma très courant testé en priorité par les outils de cassage, malgré la présence d'une majuscule et d'un symbole.",
  },
  {
    id: "B",
    text: "correcttigervalisecouteau (une phrase de passe de quatre mots choisis au hasard, sans lien logique)",
    answer: "robuste",
    explanation: "Une phrase de passe de quatre mots aléatoires est longue et imprévisible malgré l'absence de majuscules ou de symboles — la longueur et l'absence de schéma logique comptent davantage que la complexité apparente.",
  },
  {
    id: "C",
    text: "P@ssw0rd123",
    answer: "faible",
    explanation: "Malgré les substitutions visuelles (@ pour a, 0 pour o), ce schéma reste extrêmement prévisible et figure parmi les mots de passe les plus testés au monde par les outils de cassage automatisés.",
  },
  {
    id: "D",
    text: "Mot de passe généré aléatoirement par un gestionnaire de mots de passe (18 caractères, lettres/chiffres/symboles sans aucune logique)",
    answer: "tresrobuste",
    explanation: "Un mot de passe généré aléatoirement par un gestionnaire est nettement plus robuste que ce qu'un humain produirait naturellement — à condition que le mot de passe maître du gestionnaire soit lui-même solide.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module5-coffre-mots-passe",
  title: "Coffre-Fort des Mots de Passe",
  moduleTag: "Module 5 · Lab interactif",
  description:
    "Quatre mots de passe à classer sur une échelle de robustesse : Faible, Correct, Robuste, Très robuste. Attention, les symboles et majuscules comptent moins qu'on ne le pense.",
  participantPitch: "Évaluez la robustesse de 4 mots de passe en moins de 6 minutes.",
  formateurPitch: "Repérez en direct les mots de passe les plus souvent mal évalués par le groupe.",
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
          <strong>À revoir :</strong> les mots de passe ${missed.map((m) => m.id).join(", ")} méritent une relecture — le débrief collectif y reviendra.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} bonnes réponses (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> la longueur et l'absence de schéma logique comptent bien plus que les symboles ou les substitutions visuelles (@ pour a, 0 pour o) — une phrase de passe de plusieurs mots aléatoires bat souvent un mot de passe complexe mais court.
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
          <div class="bar-label">Mot de passe ${r.s.id}<span class="bar-cat">Réponse attendue : ${LEVEL_LABEL[r.s.answer]}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par mot de passe — du plus difficile au plus facile</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const s = SCENARIOS.find((x) => x.id === d.id);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px; font-family:var(--mono);">${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${LEVEL_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${LEVEL_LABEL[s.answer]}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par mot de passe</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Mot de passe " + s.id,
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === s.id);
        return d ? (d.correct ? "Correct" : "Incorrect (" + LEVEL_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const levelBtnsHtml = LEVELS.map(
    (l) => `<button class="toggle-btn level-btn" data-val="${l.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; flex:1 1 40%;">${l.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">MOT DE PASSE ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:500px; margin:0 auto;">
      <span class="eyebrow">Quel niveau de robustesse ?</span>
      <div style="background:var(--paper); border:1.5px solid #DCD7C8; border-radius:10px; padding:14px 16px; margin:12px 0 20px; font-family:var(--mono); font-size:14px; color:var(--ink); word-break:break-word;">${LabEngine.escapeHtml(s.text)}</div>
      <div class="toggle-row" id="level-row" style="flex-wrap:wrap; margin-bottom:0;">${levelBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#level-row .level-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#level-row .level-btn").forEach((x) => {
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
    container.querySelectorAll(".level-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + LEVEL_LABEL[s.answer]}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === SCENARIOS.length - 1 ? "Voir mon résultat →" : "Mot de passe suivant →"}
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
