// module8-cycle-incident/lab-content.js
//
// Lab 1 du Module 8 : "Simulez le cycle de gestion d'un incident". Point de
// départ : un scénario de rançongiciel un vendredi soir, RSSI injoignable.
// Six actions concrètes à associer à la bonne étape du cycle en cinq étapes
// (Préparation / Détection & analyse / Confinement / Éradication &
// récupération / Retour d'expérience). Choix unique par action parmi les 5
// étapes, feedback immédiat.

const STEPS = [
  { key: "preparation", label: "Préparation" },
  { key: "detection", label: "Détection & analyse" },
  { key: "confinement", label: "Confinement" },
  { key: "eradication", label: "Éradication & récupération" },
  { key: "retour", label: "Retour d'expérience" },
];
const STEP_LABEL = Object.fromEntries(STEPS.map((s) => [s.key, s.label]));

const SCENARIO_TEXT =
  "Il est 16h30 un vendredi. Plusieurs collaborateurs signalent presque simultanément que leurs fichiers portent une extension inconnue et qu'un message réclame le paiement d'une rançon pour les récupérer. Le RSSI est en congé jusqu'à lundi.";

const ACTIONS = [
  {
    id: "A",
    text: "Avoir prédéfini, avant tout incident, un canal de signalement clair et des rôles de secours en cas d'indisponibilité du RSSI.",
    answer: "preparation",
    explanation: "Cette action se déroule avant qu'un incident ne survienne — c'est la définition même de l'étape de préparation, qui rend possible une réaction efficace le jour où un incident se produit réellement.",
  },
  {
    id: "B",
    text: "Alerter immédiatement le canal de signalement dès les premiers messages des collaborateurs concernant leurs fichiers.",
    answer: "detection",
    explanation: "Faire remonter l'information dès les premiers signaux fait partie de la détection et de l'analyse initiale de l'incident, avant toute action de confinement.",
  },
  {
    id: "C",
    text: "Isoler immédiatement les postes concernés du reste du réseau, sans les éteindre.",
    answer: "confinement",
    explanation: "Limiter la propagation à d'autres machines, sans détruire les preuves utiles en éteignant brutalement les postes, correspond exactement à l'étape de confinement.",
  },
  {
    id: "D",
    text: "Restaurer les fichiers chiffrés à partir d'une sauvegarde saine, après avoir confirmé que la menace est neutralisée.",
    answer: "eradication",
    explanation: "Le retour à un fonctionnement normal après avoir supprimé la cause de l'incident correspond à l'étape d'éradication et de récupération.",
  },
  {
    id: "E",
    text: "Documenter précisément la chronologie des événements au fur et à mesure qu'ils se produisent.",
    answer: "detection",
    explanation: "La documentation de la chronologie commence dès la détection et se poursuit tout au long de l'incident — elle nourrit directement l'étape de retour d'expérience qui suivra.",
  },
  {
    id: "F",
    text: "Le lundi suivant, analyser ce qui a permis l'infection et mettre à jour la procédure de sauvegarde en conséquence.",
    answer: "retour",
    explanation: "Analyser l'incident une fois résolu pour améliorer la préparation future est la définition du retour d'expérience — l'étape la plus souvent négligée une fois le retour à la normale obtenu.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module8-cycle-incident",
  title: "Cycle de l'Incident",
  moduleTag: "Module 8 · Lab interactif",
  description:
    "Un rançongiciel frappe un vendredi soir, RSSI injoignable. Associez six actions concrètes à la bonne étape du cycle de gestion d'incident.",
  participantPitch: "Associez 6 actions aux 5 étapes du cycle de gestion d'incident, en 8 minutes.",
  formateurPitch: "Voyez en direct quelle étape du cycle est la plus souvent confondue avec une autre.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 6 actions sont enregistrées.",

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
          <strong>À revoir :</strong> les actions ${missed.map((m) => m.id).join(", ")} méritent une relecture — le débrief collectif y reviendra.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} bonnes réponses (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> le cycle de gestion d'incident est circulaire, pas linéaire — le retour d'expérience du lundi vient enrichir la préparation du prochain incident. C'est l'étape la plus souvent négligée une fois le retour à la normale obtenu, alors qu'elle conditionne la qualité de la réponse suivante.
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
    const perAction = {};
    ACTIONS.forEach((a) => (perAction[a.id] = { correct: 0, total: 0 }));
    records.forEach((r) => {
      (r.details || []).forEach((d) => {
        if (!perAction[d.id]) return;
        perAction[d.id].total++;
        if (d.correct) perAction[d.id].correct++;
      });
    });
    const rows = ACTIONS.map((a) => {
      const p = perAction[a.id];
      const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
      return { a, pct, total: p.total };
    }).sort((x, y) => x.pct - y.pct);

    let barsHtml = "";
    rows.forEach((r) => {
      const cls = r.pct >= 80 ? "low" : r.pct >= 50 ? "mid" : "high";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">Action ${r.a.id}<span class="bar-cat">Étape attendue : ${STEP_LABEL[r.a.answer]}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${ACTIONS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par action — du plus difficile au plus facile</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const a = ACTIONS.find((x) => x.id === d.id);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;">${LabEngine.escapeHtml(a.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${STEP_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${STEP_LABEL[a.answer]}</span>` : ""}
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par action</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...ACTIONS.map((a) => ({
      header: "Action " + a.id,
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === a.id);
        return d ? (d.correct ? "Correct" : "Incorrect (" + STEP_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const a = ACTIONS[idx];
  const stepBtnsHtml = STEPS.map(
    (s) => `<button class="toggle-btn step-btn" data-val="${s.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; flex:1 1 45%;">${s.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / ACTIONS.length) * 100}%"></div></div>
      <div class="progress-label">ACTION ${idx + 1} / ${ACTIONS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:520px; margin:0 auto;">
      ${idx === 0 ? `<div style="background:var(--paper); border:1.5px solid #DCD7C8; border-radius:10px; padding:12px 14px; margin-bottom:16px; font-size:13px; color:var(--ink); line-height:1.5;"><strong>Contexte :</strong> ${LabEngine.escapeHtml(SCENARIO_TEXT)}</div>` : ""}
      <span class="eyebrow">À quelle étape du cycle appartient cette action ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(a.text)}</p>
      <div class="toggle-row" id="step-row" style="flex-wrap:wrap; margin-bottom:0;">${stepBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#step-row .step-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#step-row .step-btn").forEach((x) => {
        const active = x === b;
        x.style.background = active ? "var(--navy)" : "var(--paper)";
        x.style.color = active ? "#fff" : "var(--navy)";
        x.style.borderColor = active ? "var(--navy)" : "#DCD7C8";
      });
      document.getElementById("validate-btn").disabled = false;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = chosen === a.answer;
    results.push({ id: a.id, chosen, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".step-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + STEP_LABEL[a.answer]}
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(a.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === ACTIONS.length - 1 ? "Voir mon résultat →" : "Action suivante →"}
      </button>
    `;
    document.getElementById("next-btn").onclick = () => {
      idx++;
      if (idx < ACTIONS.length) {
        renderScenario(container);
      } else {
        finishGame();
      }
    };
  };
}

function finishGame() {
  const score = results.filter((r) => r.correct).length;
  LabEngine.submitResult({ score, total: ACTIONS.length, details: results });
}
