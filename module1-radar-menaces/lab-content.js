// module1-radar-menaces/lab-content.js
//
// Lab 2 du Module 1 : "Reconnaître les grandes catégories de cybermenaces".
// Contrairement au Traqueur d'Exposition (tri auto-évalué, sans bonne/mauvaise
// réponse), ce lab a de vraies réponses correctes — le mécanisme choisi est
// donc un quiz à deux axes avec feedback immédiat après chaque scénario.

const SCENARIOS = [
  {
    id: "A",
    text: "Un collaborateur clique par erreur sur un lien reçu par e-mail, permettant à un logiciel malveillant de s'installer sur son poste.",
    origin: "externe",
    intent: "intentionnelle",
    explanation: "L'origine est externe (un attaquant), même si le vecteur d'entrée repose sur une action humaine involontaire — une combinaison très fréquente. L'intention malveillante vient de l'attaquant, pas du collaborateur.",
  },
  {
    id: "B",
    text: "Une employée, mécontente de son licenciement à venir, copie délibérément des documents confidentiels avant son départ pour les transmettre à un concurrent.",
    origin: "interne",
    intent: "intentionnelle",
    explanation: "L'origine est interne à l'organisation et l'action est parfaitement délibérée — une catégorie de menace bien distincte de l'erreur humaine involontaire.",
  },
  {
    id: "C",
    text: "Une panne de climatisation dans une salle serveur provoque une surchauffe qui endommage plusieurs équipements et interrompt un service pendant plusieurs heures.",
    origin: "interne",
    intent: "non-intentionnelle",
    explanation: "Aucune intention malveillante n'est impliquée ici. La cybersécurité couvre aussi des risques accidentels et environnementaux internes à l'organisation, pas uniquement des attaques délibérées.",
  },
  {
    id: "D",
    text: "Un groupe organisé mène une campagne ciblée et méthodique contre plusieurs entreprises d'un même secteur, avec des moyens techniques sophistiqués déployés sur plusieurs mois.",
    origin: "externe",
    intent: "intentionnelle",
    explanation: "La sophistication, la durée et le ciblage sectoriel distinguent cette menace organisée et intentionnelle d'une simple attaque opportuniste.",
  },
  {
    id: "E",
    text: "Un stagiaire copie par erreur des données confidentielles sur une clé USB personnelle, sans aucune intention de nuire, simplement pour travailler plus facilement de chez lui.",
    origin: "interne",
    intent: "non-intentionnelle",
    explanation: "L'origine est interne, mais sans aucune intention malveillante — une erreur humaine de bonne foi reste une menace réelle pour la confidentialité des données, au même titre qu'un acte délibéré.",
  },
  {
    id: "F",
    text: "Une coupure de courant chez l'hébergeur cloud utilisé par l'entreprise provoque une interruption de service de plusieurs heures, sans lien avec une quelconque cyberattaque.",
    origin: "externe",
    intent: "non-intentionnelle",
    explanation: "L'origine est externe à l'organisation (un prestataire), mais sans intention malveillante — un exemple classique de menace accidentelle venant de l'extérieur, souvent moins intuitive à classer.",
  },
];

let idx = 0;
let results = []; // { id, chosenOrigin, chosenIntent, correct }

window.LabConfig = {
  id: "module1-radar-menaces",
  title: "Radar des Menaces",
  moduleTag: "Module 1 · Lab interactif",
  description:
    "Six situations, deux questions à chaque fois : d'où vient la menace, et est-elle intentionnelle ? Un quiz rapide pour apprendre à classer un incident avant même de savoir comment y réagir.",
  participantPitch: "Classez 6 situations en moins de 10 minutes et obtenez votre score en temps réel.",
  formateurPitch: "Suivez les scores en direct et repérez la catégorie de menace la plus souvent mal classée par le groupe.",
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
          <strong>À retenir :</strong> l'origine (interne/externe) et le caractère intentionnel d'une menace ne sont pas toujours ce qu'on croit au premier regard — une erreur humaine de bonne foi reste une menace réelle, tout comme un incident purement accidentel venant de l'extérieur.
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
          <div class="bar-label">Scénario ${r.s.id}<span class="bar-cat">${r.s.origin} · ${r.s.intent}</span></div>
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
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;">${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${d.chosenOrigin} / ${d.chosenIntent}</span>
            ${!d.correct ? `<span style="font-family:var(--mono); font-size:11px; color:var(--low);">Attendu : ${s.origin} / ${s.intent}</span>` : ""}
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
        return d ? (d.correct ? "Correct" : "Incorrect (" + d.chosenOrigin + "/" + d.chosenIntent + ")") : "";
      },
    })),
  ],
};

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];
  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SCÉNARIO ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:480px; margin:0 auto;">
      <span class="eyebrow">Situation à classer</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:22px;">${LabEngine.escapeHtml(s.text)}</p>

      <div style="margin-bottom:18px;">
        <span class="eyebrow" style="display:block; margin-bottom:8px; color:var(--gray);">D'où vient la menace ?</span>
        <div class="toggle-row" id="origin-row" style="margin-bottom:0;">
          <button class="toggle-btn" data-val="interne" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">Interne</button>
          <button class="toggle-btn" data-val="externe" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">Externe</button>
        </div>
      </div>

      <div style="margin-bottom:22px;">
        <span class="eyebrow" style="display:block; margin-bottom:8px; color:var(--gray);">Est-elle intentionnelle ?</span>
        <div class="toggle-row" id="intent-row" style="margin-bottom:0;">
          <button class="toggle-btn" data-val="intentionnelle" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">Intentionnelle</button>
          <button class="toggle-btn" data-val="non-intentionnelle" style="background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8;">Non intentionnelle</button>
        </div>
      </div>

      <button class="btn-primary" id="validate-btn" disabled>Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosenOrigin = null, chosenIntent = null;

  container.querySelectorAll("#origin-row .toggle-btn").forEach((b) => {
    b.onclick = () => {
      chosenOrigin = b.dataset.val;
      container.querySelectorAll("#origin-row .toggle-btn").forEach((x) => x.classList.toggle("active", x === b));
      container.querySelectorAll("#origin-row .toggle-btn").forEach((x) => {
        x.style.background = x === b ? "var(--navy)" : "var(--paper)";
        x.style.color = x === b ? "#fff" : "var(--navy)";
      });
      checkReady();
    };
  });
  container.querySelectorAll("#intent-row .toggle-btn").forEach((b) => {
    b.onclick = () => {
      chosenIntent = b.dataset.val;
      container.querySelectorAll("#intent-row .toggle-btn").forEach((x) => {
        x.style.background = x === b ? "var(--navy)" : "var(--paper)";
        x.style.color = x === b ? "#fff" : "var(--navy)";
      });
      checkReady();
    };
  });

  function checkReady() {
    document.getElementById("validate-btn").disabled = !(chosenOrigin && chosenIntent);
  }

  document.getElementById("validate-btn").onclick = () => {
    const correct = chosenOrigin === s.origin && chosenIntent === s.intent;
    results.push({ id: s.id, chosenOrigin, chosenIntent, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll("#origin-row .toggle-btn, #intent-row .toggle-btn").forEach((b) => (b.disabled = true));

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
