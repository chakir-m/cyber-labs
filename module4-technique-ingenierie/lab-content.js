// module4-technique-ingenierie/lab-content.js
//
// Lab 2 du Module 4 : "Reconnaître la technique d'ingénierie sociale" — cinq
// situations à relier à la bonne technique parmi vishing, baiting,
// pretexting, smishing, quishing. Choix unique, feedback immédiat. Le piège
// pédagogique ciblé est la confusion entre vishing (urgence d'un seul appel)
// et pretexting (confiance construite patiemment sur plusieurs échanges).

const TECHNIQUES = [
  { key: "vishing", label: "Vishing" },
  { key: "baiting", label: "Baiting" },
  { key: "pretexting", label: "Pretexting" },
  { key: "smishing", label: "Smishing" },
  { key: "quishing", label: "Quishing" },
];
const TECH_LABEL = Object.fromEntries(TECHNIQUES.map((t) => [t.key, t.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Un appel téléphonique se présentant comme le service informatique demande d'installer un « outil de diagnostic » suite à une prétendue activité suspecte détectée sur le poste.",
    answer: "vishing",
    explanation: "L'usage du canal téléphonique pour appliquer les ressorts de l'urgence et de l'autorité caractérise le vishing (hameçonnage vocal) — illustré ici par l'exemple du faux support informatique.",
  },
  {
    id: "B",
    text: "Une clé USB étiquetée « Salaires 2026 — Confidentiel » est retrouvée dans le hall d'entrée d'une entreprise. Un employé curieux la branche sur son poste pour savoir ce qu'elle contient.",
    answer: "baiting",
    explanation: "L'appât physique exploitant la curiosité est la signature du baiting (appâtage) — la clé USB peut contenir un malware s'exécutant automatiquement à la connexion.",
  },
  {
    id: "C",
    text: "Une personne se présentant comme un nouvel auditeur externe échange plusieurs e-mails cordiaux avec un collaborateur sur plusieurs jours avant de lui demander un accès à un dossier interne, en toute confiance apparente.",
    answer: "pretexting",
    explanation: "La construction progressive d'un scénario crédible avant la demande sensible est caractéristique du pretexting (scénario prétexte), qui se distingue justement du vishing par sa patience — pas d'urgence, mais une confiance construite sur la durée.",
  },
  {
    id: "D",
    text: "Un SMS annonçant un colis en attente de livraison invite à cliquer sur un lien pour régler des frais de douane de quelques dirhams.",
    answer: "smishing",
    explanation: "L'application des ressorts du phishing au canal SMS correspond au smishing, souvent construit autour de faux avis de livraison.",
  },
  {
    id: "E",
    text: "Un QR code affiché sur une affiche de parking annonce un tarif préférentiel si le paiement est effectué en scannant le code, qui redirige en réalité vers un faux site de paiement.",
    answer: "quishing",
    explanation: "L'usage d'un QR code pour dissimuler la destination réelle d'un lien est la signature du quishing, une tendance émergente qui contourne le réflexe habituel de vérification d'une adresse écrite.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module4-technique-ingenierie",
  title: "Techniques d'Ingénierie Sociale",
  moduleTag: "Module 4 · Lab interactif",
  description:
    "Cinq situations, une seule technique d'ingénierie sociale à retrouver parmi cinq : vishing, baiting, pretexting, smishing, quishing.",
  participantPitch: "Identifiez la bonne technique pour 5 situations en moins de 8 minutes.",
  formateurPitch: "Repérez en direct la technique la plus souvent confondue par le groupe — souvent vishing/pretexting.",
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
          <strong>À retenir :</strong> le vishing agit dans l'urgence immédiate d'un seul appel, tandis que le pretexting construit patiemment la confiance sur plusieurs échanges avant la demande sensible — deux techniques à ne pas confondre malgré leur point commun (un contact humain direct).
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
          <div class="bar-label">Situation ${r.s.id}<span class="bar-cat">Réponse attendue : ${TECH_LABEL[r.s.answer]}</span></div>
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
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${TECH_LABEL[d.chosen]}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${TECH_LABEL[s.answer]}</span>` : ""}
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
        return d ? (d.correct ? "Correct" : "Incorrect (" + TECH_LABEL[d.chosen] + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  const techBtnsHtml = TECHNIQUES.map(
    (t) => `<button class="toggle-btn tech-btn" data-val="${t.key}" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; flex:1 1 30%;">${t.label}</button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SITUATION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:500px; margin:0 auto;">
      <span class="eyebrow">Quelle technique d'ingénierie sociale ?</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:20px;">${LabEngine.escapeHtml(s.text)}</p>
      <div class="toggle-row" id="tech-row" style="flex-wrap:wrap; margin-bottom:0;">${techBtnsHtml}</div>
      <button class="btn-primary" id="validate-btn" disabled style="margin-top:18px;">Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosen = null;
  container.querySelectorAll("#tech-row .tech-btn").forEach((b) => {
    b.onclick = () => {
      chosen = b.dataset.val;
      container.querySelectorAll("#tech-row .tech-btn").forEach((x) => {
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
    container.querySelectorAll(".tech-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + TECH_LABEL[s.answer]}
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
