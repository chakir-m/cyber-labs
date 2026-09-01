// module10-feu-objets-connectes/lab-content.js
//
// Lab 2 du Module 10 : "Sécuriser un objet connecté". Quatre situations
// d'objets connectés (caméras, imprimante réseau, assistant vocal) à
// évaluer sur l'échelle à 3 niveaux (Faible / Modéré / Élevé), même
// mécanique que les labs "Feu" précédents (Modules 3, 6, 7). Le fil rouge
// du module — le botnet Mirai — montre comment des objets individuellement
// anodins deviennent une menace collective une fois compromis en masse.

const TIERS = [
  { key: "faible", label: "🟢 Risque faible" },
  { key: "modere", label: "🟠 Risque modéré" },
  { key: "eleve", label: "🔴 Risque élevé" },
];
const TIER_LABEL = Object.fromEntries(TIERS.map((t) => [t.key, t.label]));

const SCENARIOS = [
  {
    id: "A",
    text: "Une caméra de surveillance connectée conserve le mot de passe administrateur défini en usine, jamais modifié, et reste directement accessible depuis internet pour faciliter la consultation à distance.",
    accepted: ["eleve"],
    verdict: "Risque élevé",
    explanation: "Un mot de passe par défaut combiné à une exposition directe sur internet est exactement le schéma qui a permis la constitution du botnet Mirai en 2016 — des centaines de milliers d'objets compromis en quelques semaines à cause de cette seule combinaison.",
  },
  {
    id: "B",
    text: "Une imprimante réseau connectée est installée sur un réseau Wi-Fi invité, totalement séparé du réseau utilisé par les postes de travail de l'entreprise, avec mises à jour de sécurité automatiques activées.",
    accepted: ["faible"],
    verdict: "Risque faible (bonne pratique)",
    explanation: "L'isolement réseau et les mises à jour automatiques appliquent les deux réflexes les plus efficaces face aux objets connectés : limiter la portée d'une éventuelle compromission et réduire la fenêtre d'exploitation des vulnérabilités connues.",
  },
  {
    id: "C",
    text: "Un objet connecté fonctionne avec un micrologiciel qui n'a plus reçu de mise à jour de sécurité depuis plusieurs années, le fabricant ayant cessé de le prendre en charge, mais l'appareil reste isolé sur un réseau séparé du reste de l'entreprise.",
    accepted: ["modere"],
    verdict: "Risque modéré",
    explanation: "La vulnérabilité technique reste réelle et s'aggrave avec le temps, mais l'isolement réseau réduit la probabilité qu'elle soit exploitée à distance — un risque contenu par une mesure compensatoire, mais pas éliminé, car un accès physique ou une compromission du réseau isolé lui-même resterait possible.",
  },
  {
    id: "D",
    text: "Un assistant vocal domestique reste connecté au même réseau Wi-Fi que l'ordinateur professionnel utilisé en télétravail par son propriétaire.",
    accepted: ["modere", "eleve"],
    verdict: "Risque modéré à élevé",
    explanation: "Les objets connectés domestiques sont souvent moins sécurisés que les équipements professionnels et peuvent servir de point d'entrée vers l'ensemble du réseau, y compris l'ordinateur professionnel qui y est connecté.",
  },
];

let idx = 0;
let results = []; // { id, chosen, correct }

window.LabConfig = {
  id: "module10-feu-objets-connectes",
  title: "Feu des Objets Connectés",
  moduleTag: "Module 10 · Lab interactif",
  description:
    "Quatre situations d'objets connectés à évaluer : Faible, Modéré ou Élevé. Un objet individuellement anodin peut devenir une menace collective une fois compromis en masse.",
  participantPitch: "Évaluez le niveau de risque de 4 objets connectés en moins de 6 minutes.",
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
          <strong>À retenir :</strong> le fait qu'un objet connecté « fonctionne très bien » ne dit rien de sa sécurité — mot de passe par défaut, exposition directe sur internet et absence d'isolement réseau sont les trois facteurs qui, combinés, ont permis la constitution du botnet Mirai à partir de simples caméras et objets domestiques.
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
