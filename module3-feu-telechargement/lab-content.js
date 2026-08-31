// module3-feu-telechargement/lab-content.js
//
// Lab "Évaluez ces demandes de téléchargement" (cahier Module 3). Quatre
// situations à classer selon un niveau de risque à trois paliers (Faible /
// Modéré / Élevé), sur le modèle d'un feu tricolore — les couleurs faible/
// moyen/élevé déjà utilisées ailleurs dans le moteur (vert/or/rouge)
// prennent ici tout leur sens visuel. Choix unique par situation.

const TIERS = [
  { key: "faible", label: "🟢 Risque faible", color: "var(--low)" },
  { key: "modere", label: "🟠 Risque modéré", color: "var(--mid)" },
  { key: "eleve", label: "🔴 Risque élevé", color: "var(--high)" },
];
const TIER_LABEL = Object.fromEntries(TIERS.map((t) => [t.key, t.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Un collègue vous envoie un lien vers le site officiel de l'éditeur pour télécharger la dernière mise à jour du logiciel de comptabilité utilisé par toute l'entreprise, avec un message annonçant simplement la sortie de cette mise à jour.",
    accepted: ["faible"],
    verdict: "Risque faible — mais à vérifier",
    explanation: "La source (site officiel de l'éditeur) et l'absence de pression ou d'urgence sont rassurantes. Il reste recommandé de vérifier l'adresse exacte du site plutôt que de cliquer directement sur le lien reçu, par réflexe systématique — même une source apparemment légitime mérite cette vérification.",
  },
  {
    id: "B",
    text: "Une fenêtre s'affiche pendant la navigation, annonçant que l'ordinateur est infecté par « 5 virus » et proposant de télécharger immédiatement un outil de nettoyage gratuit pour résoudre le problème.",
    accepted: ["eleve"],
    verdict: "Risque élevé — à ne pas télécharger",
    explanation: "Ce schéma (alerte alarmiste non sollicitée + solution immédiate à télécharger) est un classique de faux logiciel de sécurité, souvent lui-même un cheval de Troie ou un adware. Un vrai antivirus n'alerte jamais de cette façon via une fenêtre de navigateur.",
  },
  {
    id: "C",
    text: "Un e-mail, apparemment du service informatique, demande d'installer en urgence un correctif de sécurité via un lien fourni, en insistant sur le fait que l'opération doit être faite avant la fin de la journée.",
    accepted: ["eleve"],
    verdict: "Risque élevé — à vérifier avant toute action",
    explanation: "L'urgence artificielle et le lien direct plutôt qu'un canal interne connu sont des signaux d'alerte classiques. Il faut vérifier auprès du service informatique par un canal indépendant avant d'agir, jamais cliquer directement.",
  },
  {
    id: "D",
    text: "Un collaborateur souhaite installer un outil de prise de notes trouvé sur un site de téléchargement généraliste, non affilié à l'éditeur officiel de l'outil, en dehors du magasin d'applications habituel de l'entreprise.",
    accepted: ["modere", "eleve"],
    verdict: "Risque modéré à élevé — à éviter",
    explanation: "Un téléchargement en dehors des canaux officiels ou approuvés par l'entreprise est un vecteur classique de cheval de Troie, comme vu avec l'exemple du convertisseur de fichiers piégé. Mieux vaut passer par le canal logiciel approuvé par l'organisation.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module3-feu-telechargement",
  title: "Feu Rouge du Téléchargement",
  moduleTag: "Module 3 · Lab interactif",
  description:
    "Quatre demandes de téléchargement à évaluer, comme au feu tricolore : faible, modéré ou élevé. La source d'un lien ne suffit jamais à elle seule à trancher.",
  participantPitch: "Évaluez le niveau de risque de 4 situations de téléchargement en moins de 8 minutes.",
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
          <strong>À retenir :</strong> une source apparemment légitime (site officiel, e-mail « du service informatique ») ne suffit jamais à elle seule à écarter le risque — l'absence de pression et la vérification systématique du canal comptent tout autant que l'origine apparente du message.
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
      <span class="eyebrow">Quel niveau de risque ?</span>
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
