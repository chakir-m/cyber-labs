// module7-verificateur-321/lab-content.js
//
// Lab 1 du Module 7 : "Construire une stratégie de sauvegarde 3-2-1". Trois
// dispositifs de sauvegarde décrits, chacun à évaluer contre les trois
// critères de la règle 3-2-1 (au moins 3 copies / au moins 2 supports
// différents / au moins 1 copie hors site ou déconnectée) via une checklist
// multi-sélection. Score calculé critère par critère (comme pour Anatomie
// du Phishing), sur 9 points au total (3 critères × 3 dispositifs).

const CRITERIA = [
  { key: "copies", label: "Au moins 3 copies distinctes de la donnée" },
  { key: "supports", label: "Au moins 2 supports différents" },
  { key: "horssite", label: "Au moins 1 copie hors site ou déconnectée du réseau" },
];

const SCENARIOS = [
  {
    id: "A",
    title: "Le cabinet comptable",
    text: "Un cabinet comptable conserve l'original de ses dossiers sur son serveur local, et effectue chaque soir une copie sur un disque dur externe qui reste branché en permanence au même serveur. Aucun test de restauration n'a jamais été réalisé depuis la mise en place, il y a quatre ans.",
    met: { copies: false, supports: true, horssite: false },
    explanation: "Il n'existe que deux copies (serveur + disque externe), pas trois : critère non rempli. Le disque externe est bien un support différent du serveur : critère rempli. Mais il reste connecté en permanence — un rançongiciel chiffrant le serveur pourrait aussi chiffrer le disque externe : critère hors site/déconnecté non rempli.",
  },
  {
    id: "B",
    title: "La PME bien préparée",
    text: "Une PME conserve l'original sur son serveur principal, une copie automatique quotidienne sur un NAS local qui se déconnecte du réseau entre deux sauvegardes, et une troisième copie synchronisée chaque semaine vers un service cloud professionnel séparé du réseau local.",
    met: { copies: true, supports: true, horssite: true },
    explanation: "Trois copies distinctes (serveur, NAS, cloud) : critère rempli. Deux supports différents au minimum (stockage local et cloud) : critère rempli. Le NAS déconnecté entre deux sauvegardes et le cloud, physiquement hors site, remplissent tous deux le troisième critère.",
  },
  {
    id: "C",
    title: "L'indépendant pressé",
    text: "Un consultant indépendant stocke l'ensemble de ses documents de mission uniquement sur le disque dur interne de son ordinateur portable, sans aucune copie ailleurs.",
    met: { copies: false, supports: false, horssite: false },
    explanation: "Une seule copie existe : aucun des trois critères n'est rempli. C'est la situation la plus exposée possible face à une panne, un vol, ou un rançongiciel — l'ordinateur perdu ou chiffré emporterait l'intégralité des données professionnelles.",
  },
];

let idx = 0;
let chosen = new Set(); // clés cochées pour le scénario courant
let allResults = []; // { scenarioId, criterionKey, selected, correct }

window.LabConfig = {
  id: "module7-verificateur-321",
  title: "Vérificateur 3-2-1",
  moduleTag: "Module 7 · Lab interactif",
  description:
    "Trois dispositifs de sauvegarde à confronter aux trois critères de la règle 3-2-1. Cochez uniquement les critères réellement remplis par chaque dispositif décrit.",
  participantPitch: "Évaluez 3 dispositifs de sauvegarde contre la règle 3-2-1, en 8 minutes.",
  formateurPitch: "Voyez en direct quel critère (copies, supports, hors site) est le plus souvent mal évalué.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seule votre évaluation des 3 dispositifs est enregistrée.",

  renderGame(container, pseudo) {
    idx = 0;
    allResults = [];
    renderScenario(container);
  },

  renderParticipantSummary(container, record) {
    const pct = Math.round((record.score / record.total) * 100);
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} critères bien évalués (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> une sauvegarde connectée en permanence au même réseau que les données originales peut être chiffrée elle aussi par un rançongiciel — c'est la déconnexion périodique ou l'hébergement hors site qui protège réellement, pas le simple fait d'avoir « une copie quelque part ».
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
    const avgScore = records.reduce((s, r) => s + (r.score || 0), 0) / records.length;
    const perCriterion = {};
    CRITERIA.forEach((c) => (perCriterion[c.key] = { correct: 0, total: 0 }));
    records.forEach((r) => {
      (r.details || []).forEach((d) => {
        if (!perCriterion[d.criterionKey]) return;
        perCriterion[d.criterionKey].total++;
        if (d.correct) perCriterion[d.criterionKey].correct++;
      });
    });
    const rows = CRITERIA.map((c) => {
      const p = perCriterion[c.key];
      const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
      return { c, pct, total: p.total };
    }).sort((a, b) => a.pct - b.pct);

    let barsHtml = "";
    rows.forEach((r) => {
      const cls = r.pct >= 80 ? "low" : r.pct >= 50 ? "mid" : "high";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">${r.c.label}</div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length * CRITERIA.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Critère le plus souvent mal évalué, tous dispositifs confondus</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = SCENARIOS.map((s) => {
      const items = (record.details || []).filter((d) => d.scenarioId === s.id);
      const itemsHtml = items
        .map((d) => {
          const c = CRITERIA.find((x) => x.key === d.criterionKey);
          return `<div style="font-size:12px; padding:3px 0;"><span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓" : "✗"}</span> ${LabEngine.escapeHtml(c.label)} — coché : ${d.selected ? "oui" : "non"}</div>`;
        })
        .join("");
      return `<div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
        <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;"><strong>${LabEngine.escapeHtml(s.title)}</strong></div>
        ${itemsHtml}
      </div>`;
    }).join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par dispositif</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
  ],
};

/* ============ Logique du jeu (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  chosen = new Set();
  const itemsHtml = CRITERIA.map(
    (c) => `
      <button class="toggle-btn crit-btn" data-key="${c.key}" style="text-align:left; justify-content:flex-start; background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; padding:12px 14px; width:100%; display:block;">
        <span style="display:inline-block; width:20px;">☐</span> ${LabEngine.escapeHtml(c.label)}
      </button>`
  ).join("");

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">DISPOSITIF ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:520px; margin:0 auto;">
      <span class="eyebrow">${LabEngine.escapeHtml(s.title)}</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin:10px 0 20px;">${LabEngine.escapeHtml(s.text)}</p>
      <p class="desc" style="font-weight:600; color:var(--navy);">Cochez les critères de la règle 3-2-1 réellement remplis par ce dispositif :</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">${itemsHtml}</div>
      <button class="btn-primary" id="validate-btn">Valider mon évaluation</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  container.querySelectorAll(".crit-btn").forEach((b) => {
    b.onclick = () => {
      const key = b.dataset.key;
      if (chosen.has(key)) {
        chosen.delete(key);
        b.style.background = "var(--paper)";
        b.style.color = "var(--navy)";
        b.querySelector("span").textContent = "☐";
      } else {
        chosen.add(key);
        b.style.background = "var(--navy)";
        b.style.color = "#fff";
        b.querySelector("span").textContent = "☑";
      }
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const details = CRITERIA.map((c) => {
      const selected = chosen.has(c.key);
      const correct = selected === s.met[c.key];
      return { scenarioId: s.id, criterionKey: c.key, selected, correct };
    });
    allResults.push(...details);

    container.querySelectorAll(".crit-btn, #validate-btn").forEach((b) => (b.disabled = true));
    const zone = document.getElementById("feedback-zone");
    const scenarioScore = details.filter((d) => d.correct).length;
    zone.innerHTML = `
      <div style="background:${scenarioScore === CRITERIA.length ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${scenarioScore === CRITERIA.length ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${scenarioScore} / ${CRITERIA.length} critères bien évalués
        </div>
        <div style="font-size:13px; color:var(--ink); line-height:1.5;">${LabEngine.escapeHtml(s.explanation)}</div>
      </div>
      <button class="btn-next" style="margin-top:14px; width:100%;" id="next-btn">
        ${idx === SCENARIOS.length - 1 ? "Voir mon résultat →" : "Dispositif suivant →"}
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
  const score = allResults.filter((d) => d.correct).length;
  LabEngine.submitResult({ score, total: SCENARIOS.length * CRITERIA.length, details: allResults });
}
