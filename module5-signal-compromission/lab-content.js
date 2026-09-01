// module5-signal-compromission/lab-content.js
//
// Lab 2 du Module 5 : "Détecter un signe de compromission de compte". Quatre
// situations à classer en deux catégories : signe de compromission probable,
// ou situation normale non alarmante. Choix binaire, feedback immédiat. Le
// piège pédagogique ciblé : la vigilance ne doit pas se transformer en
// méfiance systématique injustifiée (situation C).

const VERDICTS = [
  { key: "compromis", label: "🚨 Signe de compromission probable" },
  { key: "normal", label: "✅ Situation normale, non alarmante" },
];
const VERDICT_LABEL = Object.fromEntries(VERDICTS.map((v) => [v.key, v.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Vous recevez une alerte automatique indiquant une connexion à votre compte de messagerie depuis un pays où vous n'avez jamais voyagé.",
    answer: "compromis",
    explanation: "Une connexion géographiquement incohérente est l'un des signes les plus fiables de compromission — il faut vérifier l'activité récente et changer le mot de passe sans délai.",
  },
  {
    id: "B",
    text: "Un collègue vous informe avoir reçu un message inhabituel envoyé depuis votre propre adresse e-mail, que vous n'avez pourtant jamais rédigé.",
    answer: "compromis",
    explanation: "Un message envoyé depuis son propre compte sans en être l'auteur est un signal direct de compte compromis, à traiter immédiatement.",
  },
  {
    id: "C",
    text: "Une application que vous utilisez régulièrement vous demande de vous reconnecter après une mise à jour de sécurité annoncée à l'avance par l'éditeur.",
    answer: "normal",
    explanation: "Une reconnexion demandée dans le cadre d'une mise à jour annoncée et légitime ne constitue pas un signe de compromission — le contexte et la source de l'annonce permettent de la distinguer d'une tentative frauduleuse. La vigilance ne doit pas se transformer en méfiance systématique injustifiée.",
  },
  {
    id: "D",
    text: "Vous constatez que votre gestionnaire de mots de passe affiche une méthode d'authentification multifacteur que vous ne reconnaissez pas parmi celles enregistrées sur votre compte.",
    answer: "compromis",
    explanation: "L'ajout d'une méthode MFA non reconnue suggère qu'un tiers a obtenu un accès suffisant pour modifier les paramètres de sécurité du compte — un cas à signaler immédiatement.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module5-signal-compromission",
  title: "Signal ou Bruit",
  moduleTag: "Module 5 · Lab interactif",
  description:
    "Quatre situations à trancher : signe probable de compromission de compte, ou événement parfaitement normal ? La vigilance ne doit pas virer à la méfiance systématique.",
  participantPitch: "Classez 4 situations en moins de 6 minutes et obtenez votre score en temps réel.",
  formateurPitch: "Repérez en direct la situation la plus souvent mal classée par le groupe — souvent la fausse alerte.",
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
          <strong>À retenir :</strong> le contexte (annonce préalable, source légitime) permet de distinguer une demande normale d'une tentative frauduleuse — la vigilance ne doit jamais se transformer en méfiance systématique injustifiée envers tout événement inhabituel.
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
          <div class="bar-label">Situation ${r.s.id}<span class="bar-cat">${VERDICT_LABEL[r.s.answer]}</span></div>
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
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${VERDICT_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${VERDICT_LABEL[s.answer]}</span>` : ""}
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
        return d ? (d.correct ? "Correct" : "Incorrect (" + VERDICT_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const verdictBtnsHtml = VERDICTS.map(
    (v) => `<button class="toggle-btn verdict-btn" data-val="${v.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">${v.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SITUATION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Signal réel ou fausse alerte ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      <div class="toggle-row" id="verdict-row" style="flex-direction:column; gap:10px; margin-bottom:0;">${verdictBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#verdict-row .verdict-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#verdict-row .verdict-btn").forEach((x) => {
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
    container.querySelectorAll(".verdict-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait"} — ${VERDICT_LABEL[s.answer]}
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
