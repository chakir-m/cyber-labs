// module8-gravite-incident/lab-content.js
//
// Lab 2 du Module 8 : classer 5 incidents selon les 3 niveaux de gravité vus
// en cours (Mineur / Majeur / Critique). Même mécanique à 3 boutons que les
// labs "Feu" précédents, avec un vocabulaire propre à ce module plutôt que
// l'échelle de risque Faible/Modéré/Élevé.

const TIERS = [
  { key: "mineur", label: "🟢 Mineur" },
  { key: "majeur", label: "🟠 Majeur" },
  { key: "critique", label: "🔴 Critique" },
];
const TIER_LABEL = Object.fromEntries(TIERS.map((t) => [t.key, t.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Un e-mail de phishing est intercepté par le filtre automatique de messagerie avant d'atteindre la boîte de réception de qui que ce soit.",
    accepted: ["mineur"],
    verdict: "Mineur",
    explanation: "L'impact est nul puisque la menace a été bloquée avant tout contact avec un utilisateur — un impact limité et une résolution automatique caractérisent un incident mineur, même s'il reste utile de le documenter.",
  },
  {
    id: "B",
    text: "Le compte de messagerie d'un collaborateur est utilisé pour envoyer des messages suspects à l'ensemble de ses contacts, suite à une compromission de son mot de passe.",
    accepted: ["majeur"],
    verdict: "Majeur",
    explanation: "L'impact touche un périmètre significatif (le compte et l'ensemble de ses contacts) sans pour autant paralyser l'activité de l'organisation — un impact significatif sur un périmètre défini caractérise un incident majeur.",
  },
  {
    id: "C",
    text: "Un rançongiciel chiffre les serveurs de production et bloque l'activité de plusieurs services pendant deux jours.",
    accepted: ["critique"],
    verdict: "Critique",
    explanation: "L'impact est large et l'activité de l'organisation est fortement perturbée sur une durée prolongée — c'est la définition même d'un incident critique.",
  },
  {
    id: "D",
    text: "Un employé signale avoir cliqué sur un lien reçu par e-mail qui lui semblait suspect ; après vérification par le service informatique, aucune conséquence technique n'est détectée.",
    accepted: ["mineur"],
    verdict: "Mineur",
    explanation: "Malgré l'absence de conséquence, ce signalement doit être traité et documenté comme un incident à part entière — un doute signalé sans impact avéré reste un incident mineur, pas une absence d'incident.",
  },
  {
    id: "E",
    text: "Une faille de configuration permet un accès non autorisé à la base de données clients pendant plusieurs heures avant sa détection.",
    accepted: ["majeur"],
    verdict: "Majeur",
    explanation: "L'impact est significatif et circonscrit à un périmètre précis (la base de données concernée), sans paralyser l'ensemble de l'activité de l'organisation — un incident majeur, à ne pas confondre avec un incident critique qui implique une perturbation plus large.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module8-gravite-incident",
  title: "Niveau de Gravité",
  moduleTag: "Module 8 · Lab interactif",
  description:
    "Cinq incidents à classer selon leur niveau de gravité : Mineur, Majeur ou Critique. Un incident sans conséquence visible reste un incident à documenter.",
  participantPitch: "Classez 5 incidents par niveau de gravité en moins de 6 minutes.",
  formateurPitch: "Repérez en direct l'incident le plus souvent mal classé par le groupe.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seules vos réponses aux 5 situations sont enregistrées.",

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
          <strong>À retenir :</strong> la gravité d'un incident se mesure à l'ampleur de son impact réel, pas à la gravité de l'intention de départ — un clic sur un lien suspect sans conséquence détectée reste un incident mineur à documenter, tandis qu'une faille touchant un périmètre précis reste majeure sans nécessairement paralyser toute l'organisation.
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
  const tierBtnsHtml = TIERS.map(
    (t) => `<button class="toggle-btn tier-btn" data-val="${t.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">${t.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SITUATION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Quel niveau de gravité ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      <div class="toggle-row" id="tier-row" style="flex-direction:column; gap:10px; margin-bottom:0;">${tierBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#tier-row .tier-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#tier-row .tier-btn").forEach((x) => {
        const active = x === b;
        x.style.background = active ? "var(--navy)" : "var(--paper)";
        x.style.color = active ? "#fff" : "var(--navy)";
        x.style.borderColor = active ? "var(--navy)" : "#DCD7C8";
      });
      document.getElementById("validate-btn").disabled = false;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = s.accepted.includes(chosen);
    results.push({ id: s.id, chosen, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".tier-btn").forEach((b) => (b.disabled = true));

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
