// module6-faux-point-acces/lab-content.js
//
// Lab 1 du Module 6 : "Sécurisez ce déplacement professionnel". Quatre lieux
// (aéroport, hôtel, café, espace de coworking) où plusieurs réseaux Wi-Fi
// aux noms plausibles sont disponibles. Contrairement aux quiz précédents,
// les options de réponse changent à chaque situation (les noms de réseaux
// sont propres au lieu). Le point pédagogique central, répété à dessein :
// un nom de réseau qui semble officiel ne garantit RIEN — seule une
// vérification directe auprès du personnel du lieu permet de trancher.

const SCENARIOS = [
  {
    id: "A",
    place: "À l'aéroport",
    text: "Vous avez deux heures d'attente avant votre vol et devez consulter votre messagerie professionnelle. Votre téléphone détecte trois réseaux : « Aeroport_Free_WiFi », « Airport-Guest » et « Aeroport_WiFi_Officiel ».",
    options: ["Aeroport_Free_WiFi", "Airport-Guest", "Aeroport_WiFi_Officiel", "Vérifier le nom exact auprès du personnel avant de se connecter à l'un des trois"],
    answerIdx: 3,
    isNetworkList: true,
    explanation: "Aucun de ces trois noms ne garantit sa légitimité : un faux point d'accès peut très bien s'appeler « Aeroport_WiFi_Officiel » pour paraître crédible. Seule une vérification directe auprès du personnel de l'aéroport permet de confirmer le nom exact du réseau légitime.",
  },
  {
    id: "B",
    place: "À l'hôtel",
    text: "Dans votre chambre, vous cherchez à vous connecter pour finaliser un document confidentiel. Le Wi-Fi affiche « Hotel_Guest_Network » et « HotelWifi-Free », sans que la documentation fournie dans la chambre ne précise le nom exact.",
    options: ["Hotel_Guest_Network, car il ressemble le plus à un nom professionnel", "HotelWifi-Free, car l'accès est gratuit et direct", "Appeler la réception pour confirmer le nom exact du réseau avant de se connecter", "Se connecter aux deux successivement pour comparer la vitesse"],
    answerIdx: 2,
    explanation: "Le contexte hôtelier reproduit exactement les mêmes risques que l'aéroport : un nom plausible ne garantit rien. Un simple appel à la réception permet de confirmer le nom exact du réseau légitime avant toute connexion, en particulier pour un document confidentiel.",
  },
  {
    id: "C",
    place: "Dans un café",
    text: "Vous travaillez depuis un café entre deux rendez-vous. Le réseau affiché « Cafe_WiFi » demande un mot de passe, affiché sur un petit panneau au comptoir.",
    options: ["Se connecter directement, puisqu'un mot de passe est exigé donc le réseau est forcément sûr", "Demander malgré tout confirmation du nom exact du réseau au personnel avant de se connecter", "Éviter tout Wi-Fi et utiliser uniquement les données mobiles, sans jamais vérifier", "Se connecter, mais éviter uniquement les sites bancaires"],
    answerIdx: 1,
    explanation: "Un réseau protégé par mot de passe n'est pas automatiquement légitime : un faux point d'accès peut tout à fait être protégé par un mot de passe affiché publiquement, sans que cela ne garantisse sa légitimité. La vérification directe reste le seul réflexe fiable, quel que soit le lieu.",
  },
  {
    id: "D",
    place: "Dans un espace de coworking",
    text: "Vous travaillez pour la journée dans un espace de coworking partagé. Le réseau habituel du lieu, « Coworking_Members », est visible, mais un second réseau « Coworking-Members-5G » apparaît également, avec un signal plus fort.",
    options: ["Choisir Coworking-Members-5G, car un signal plus fort signifie une connexion plus fiable", "Choisir Coworking_Members, le nom habituel, sans vérification supplémentaire", "Signaler la présence de ce second réseau à l'accueil et confirmer lequel est légitime avant de se connecter", "Se connecter aux deux réseaux en alternance selon les besoins"],
    answerIdx: 2,
    explanation: "Un réseau au nom presque identique à celui habituellement utilisé (même orthographe, tiret ajouté) est une technique classique de faux point d'accès qui mise sur l'inattention. Le signaler à l'accueil et confirmer avant de se connecter reste le seul réflexe fiable, même dans un lieu fréquenté régulièrement.",
  },
];

let idx = 0;
let results = []; // { id, chosenIdx, correct }

window.LabConfig = {
  id: "module6-faux-point-acces",
  title: "Faux Point d'Accès",
  moduleTag: "Module 6 · Lab interactif",
  description:
    "Quatre lieux, plusieurs réseaux Wi-Fi aux noms plausibles à chaque fois : à vous de trouver le bon réflexe, sachant qu'un nom de réseau ne garantit jamais rien à lui seul.",
  participantPitch: "Trouvez le bon réflexe face à des réseaux Wi-Fi publics dans 4 lieux différents, en 8 minutes.",
  formateurPitch: "Voyez en direct si le réflexe de vérification systématique est bien acquis, quel que soit le lieu.",
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
          <strong>À retenir :</strong> qu'il s'agisse d'un aéroport, d'un hôtel, d'un café ou d'un espace de coworking, un nom de réseau — même officiel en apparence, même protégé par mot de passe — ne garantit jamais sa légitimité. Seule une vérification directe auprès du personnel du lieu permet de trancher.
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
          <div class="bar-label">${r.s.place}<span class="bar-cat">Situation ${r.s.id}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${SCENARIOS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Taux de bonnes réponses par lieu — du plus difficile au plus facile</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const s = SCENARIOS.find((x) => x.id === d.id);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;"><strong>${LabEngine.escapeHtml(s.place)}</strong> — ${LabEngine.escapeHtml(s.text)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Correct" : "✗ Incorrect"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">Réponse : ${LabEngine.escapeHtml(s.options[d.chosenIdx])}</span>
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail par lieu</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...SCENARIOS.map((s) => ({
      header: "Situation " + s.id + " (" + s.place + ")",
      get: (r) => {
        const d = (r.details || []).find((x) => x.id === s.id);
        return d ? (d.correct ? "Correct" : "Incorrect") : "";
      },
    })),
  ],
};

/* ============ Mockup d'écran de smartphone ============ */
function phoneScreenMarkup(s) {
  const isNetwork = !!s.isNetworkList;
  const headerText = isNetwork ? "📶 Réseaux Wi-Fi disponibles" : "🤔 Que faites-vous ?";

  const rowsHtml = s.options
    .map((opt, i) => {
      if (isNetwork && i < s.options.length - 1) {
        // Ligne "réseau Wi-Fi" avec barres de signal + cadenas
        return `
          <button class="opt-btn phone-row" data-idx="${i}" style="display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:#fff; border:none; border-bottom:1px solid #EDEAE0; padding:12px 4px;">
            <svg width="18" height="14" viewBox="0 0 18 14" style="flex:none;"><rect x="0" y="9" width="3" height="5" rx="1" fill="var(--gray)"></rect><rect x="5" y="6" width="3" height="8" rx="1" fill="var(--gray)"></rect><rect x="10" y="3" width="3" height="11" rx="1" fill="var(--navy)"></rect><rect x="15" y="0" width="3" height="14" rx="1" fill="var(--navy)"></rect></svg>
            <span class="opt-text" style="flex:1; font-size:13.5px; color:inherit; font-family:var(--mono);">${LabEngine.escapeHtml(opt)}</span>
            <span style="flex:none; font-size:13px;">🔒</span>
          </button>`;
      }
      if (isNetwork) {
        // Dernière option = action de vérification, pas un réseau
        return `
          <button class="opt-btn phone-row" data-idx="${i}" style="display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:var(--paper); border:none; border-radius:8px; padding:12px 10px; margin-top:8px;">
            <span style="flex:none; font-size:15px;">🛈</span>
            <span class="opt-text" style="flex:1; font-size:13px; color:inherit; font-weight:600;">${LabEngine.escapeHtml(opt)}</span>
          </button>`;
      }
      // Écran de décision générique (scénarios B, C, D) : options-phrases
      return `
        <button class="opt-btn phone-row" data-idx="${i}" style="display:flex; align-items:flex-start; gap:10px; width:100%; text-align:left; background:#fff; border:none; border-bottom:1px solid #EDEAE0; padding:12px 4px;">
          <span style="flex:none; width:20px; height:20px; border-radius:50%; background:var(--paper); border:1.5px solid #DCD7C8; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:10px; color:var(--navy); margin-top:1px;">${i + 1}</span>
          <span class="opt-text" style="flex:1; font-size:13px; color:inherit; line-height:1.5;">${LabEngine.escapeHtml(opt)}</span>
        </button>`;
    })
    .join("");

  return `
    <div class="phone-mockup" style="max-width:300px; margin:0 auto 16px; border:7px solid var(--navy-dark); border-radius:28px; overflow:hidden; background:#fff; box-shadow:0 14px 30px rgba(18,23,63,.18);">
      <div style="background:var(--navy-dark); color:#fff; font-family:var(--mono); font-size:10px; padding:7px 16px; display:flex; justify-content:space-between; align-items:center;">
        <span>9:41</span><span>${LabEngine.escapeHtml(s.place)}</span><span>🔋</span>
      </div>
      <div style="padding:12px 14px 6px;">
        <div style="font-weight:700; font-size:12.5px; color:var(--navy); margin-bottom:6px;">${headerText}</div>
        ${rowsHtml}
      </div>
    </div>`;
}

/* ============ Logique du quiz (interne à ce lab) ============ */
function renderScenario(container) {
  const s = SCENARIOS[idx];

  container.innerHTML = `
    <div class="progress-row" style="max-width:560px; margin:0 auto; padding:0 0 8px;">
      <div class="progress-track"><div class="progress-fill" style="width:${(idx / SCENARIOS.length) * 100}%"></div></div>
      <div class="progress-label">SITUATION ${idx + 1} / ${SCENARIOS.length}</div>
    </div>
    <div class="card-shell fade-in" style="max-width:520px; margin:0 auto;">
      <span class="eyebrow">${LabEngine.escapeHtml(s.place)}</span>
      <p class="desc" style="font-size:15px; color:var(--ink); margin-bottom:16px;">${LabEngine.escapeHtml(s.text)}</p>
      ${phoneScreenMarkup(s)}
      <button class="btn-primary" id="validate-btn" disabled>Valider ma réponse</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  let chosenIdx = null;
  container.querySelectorAll(".opt-btn").forEach((b) => {
    b.dataset.bg = b.style.background || "#fff";
    b.onclick = () => {
      chosenIdx = parseInt(b.dataset.idx, 10);
      container.querySelectorAll(".opt-btn").forEach((x) => {
        const active = x === b;
        x.style.background = active ? "var(--navy)" : x.dataset.bg;
        x.style.color = active ? "#fff" : "var(--ink)";
      });
      document.getElementById("validate-btn").disabled = false;
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    const correct = chosenIdx === s.answerIdx;
    results.push({ id: s.id, chosenIdx, correct });

    document.getElementById("validate-btn").classList.add("hidden");
    container.querySelectorAll(".opt-btn").forEach((b) => (b.disabled = true));

    const zone = document.getElementById("feedback-zone");
    zone.innerHTML = `
      <div style="background:${correct ? "#E7F3EC" : "#FBEAEA"}; border-radius:12px; padding:14px 16px;">
        <div style="font-weight:700; color:${correct ? "var(--low)" : "var(--high)"}; margin-bottom:6px;">
          ${correct ? "✓ Correct !" : "✗ Pas tout à fait — réponse attendue : " + LabEngine.escapeHtml(s.options[s.answerIdx])}
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
