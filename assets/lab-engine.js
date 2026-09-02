// assets/lab-engine.js
//
// ============================================================================
// MOTEUR PARTAGÉ — commun à tous les labs. Ne pas modifier depuis un lab
// particulier : toute correction ici s'applique automatiquement à tous les
// labs qui l'utilisent.
//
// Chaque lab fournit un objet `window.LabConfig` (dans son propre fichier
// lab-content.js) qui décrit son contenu spécifique. Voir le gabarit
// "assets/lab-content.template.js" pour la liste complète des propriétés
// attendues et des exemples commentés.
// ============================================================================

const LabEngine = (function () {
  let pseudo = "";
  let pollTimer = null;
  let currentRecords = []; // dernier jeu de résultats chargé (pour l'export CSV)

  /* ---------------------------------------------------------------------
   * Verrouillage formateur — bloque l'accès participant si ce lab n'a pas
   * été explicitement activé (voir assets/course-lock.js). N'affecte jamais
   * l'accès formateur, qui reste toujours possible pour tester ou gérer.
   * ------------------------------------------------------------------- */
  let lockPollTimer = null;

  async function applyLockState() {
    if (!window.CourseLock || !window.LAB_ID) return; // page sans verrouillage disponible
    const btn = document.querySelector(".role-card.participant");
    if (!btn) return;

    let unlocked = true;
    try {
      unlocked = await window.CourseLock.isUnlocked(window.LAB_ID);
    } catch (e) {
      console.error("[lab-engine] Vérification du verrouillage impossible :", e);
      return; // en cas d'erreur réseau, on n'affiche pas un lab bloqué par erreur
    }

    const sub = document.getElementById("participant-pitch");
    if (!unlocked) {
      btn.classList.add("locked");
      btn.setAttribute("aria-disabled", "true");
      if (sub) {
        sub.dataset.original = sub.dataset.original || sub.textContent;
        sub.textContent = "🔒 Ce lab n'est pas encore activé par votre formateur.";
      }
    } else {
      btn.classList.remove("locked");
      btn.removeAttribute("aria-disabled");
      if (sub && sub.dataset.original) sub.textContent = sub.dataset.original;
    }
  }

  function startLockPolling() {
    applyLockState();
    if (lockPollTimer) clearInterval(lockPollTimer);
    lockPollTimer = setInterval(() => {
      const landingVisible = document.getElementById("view-landing") && !document.getElementById("view-landing").classList.contains("hidden");
      if (landingVisible) applyLockState();
      else { clearInterval(lockPollTimer); lockPollTimer = null; }
    }, 6000);
  }

  /* ---------------------------------------------------------------------
   * Jauge de risque — composant SVG partagé (cadran semi-circulaire à
   * aiguille) utilisé par tous les labs à 3 paliers (Faible/Modéré/Élevé,
   * Mineur/Majeur/Critique...). Un seul endroit à maintenir pour que ces
   * labs restent visuellement cohérents.
   *
   * tiers: tableau de 3 objets { key, label, emoji, color } dans l'ordre
   * bas -> milieu -> haut (ex. Faible, Modéré, Élevé).
   * ------------------------------------------------------------------- */
  const GAUGE_ANGLES = { 0: { arc: "M20,100 A80,80 0 0,1 60,30.7", labelX: 46, labelY: 78 }, 1: { arc: "M60,30.7 A80,80 0 0,1 140,30.7", labelX: 100, labelY: 55 }, 2: { arc: "M140,30.7 A80,80 0 0,1 180,100", labelX: 154, labelY: 78 } };
  const GAUGE_NEEDLE_ROT = { 0: -60, 1: 0, 2: 60 };

  function gaugeMarkup(tiers) {
    const arcs = tiers
      .map(
        (t, i) => `<path class="gauge-zone" data-key="${t.key}" data-idx="${i}" d="${GAUGE_ANGLES[i].arc}" fill="none" stroke="${t.color}" stroke-width="26" stroke-linecap="butt" style="cursor:pointer; opacity:.32; transition:opacity .15s ease, stroke-width .15s ease;"></path>`
      )
      .join("");
    const labels = tiers
      .map(
        (t, i) => `<text x="${GAUGE_ANGLES[i].labelX}" y="${GAUGE_ANGLES[i].labelY}" text-anchor="middle" font-family="var(--mono)" font-size="9.5" font-weight="700" fill="${t.color}" style="pointer-events:none;">${escapeHtml(t.emoji || "")}</text>`
      )
      .join("");
    return `
      <div class="risk-gauge" style="max-width:280px; margin:0 auto;">
        <svg viewBox="0 0 200 112" style="width:100%; display:block;">
          ${arcs}
          ${labels}
          <g id="gauge-needle" style="transform-origin:100px 100px; transform:rotate(0deg); opacity:0; transition:transform .5s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;">
            <line x1="100" y1="100" x2="100" y2="62" stroke="var(--navy)" stroke-width="5" stroke-linecap="round"></line>
          </g>
          <circle cx="100" cy="100" r="7" fill="var(--navy)"></circle>
        </svg>
        <div id="gauge-caption" style="text-align:center; font-family:var(--mono); font-size:12px; color:var(--gray); margin-top:2px; min-height:16px;"></div>
      </div>`;
  }

  // À appeler une fois le HTML de gaugeMarkup() inséré dans le DOM. onSelect
  // reçoit la clé du palier choisi. Retourne une fonction setSelected(key)
  // que l'appelant peut utiliser pour resynchroniser l'affichage si besoin.
  function bindGauge(container, tiers, onSelect) {
    const needle = container.querySelector("#gauge-needle");
    const caption = container.querySelector("#gauge-caption");
    function setSelected(key) {
      const idx = tiers.findIndex((t) => t.key === key);
      container.querySelectorAll(".gauge-zone").forEach((el, i) => {
        const active = i === idx;
        el.style.opacity = active ? "1" : ".32";
        el.style.strokeWidth = active ? "30" : "26";
      });
      if (idx >= 0) {
        needle.style.transform = `rotate(${GAUGE_NEEDLE_ROT[idx]}deg)`;
        needle.style.opacity = "1";
        if (caption) caption.textContent = tiers[idx].label;
      }
    }
    container.querySelectorAll(".gauge-zone").forEach((el) => {
      el.onclick = () => {
        const key = el.dataset.key;
        setSelected(key);
        onSelect(key);
      };
    });
    return setSelected;
  }

  /* ---------------------------------------------------------------------
   * Navigation entre les grands écrans de l'application
   * ------------------------------------------------------------------- */
  function goTo(view) {
    if (view === "pseudo") {
      const btn = document.querySelector(".role-card.participant");
      if (btn && btn.classList.contains("locked")) {
        alert("Ce lab n'est pas encore activé par votre formateur. Revenez-y un peu plus tard.");
        return;
      }
    }
    ["landing", "pseudo", "game", "summary", "dash", "detail"].forEach((v) => {
      const el = document.getElementById("view-" + v);
      if (el) el.classList.toggle("hidden", v !== view);
    });
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (view === "dash") {
      renderShareBlock();
      refreshDashboard();
      pollTimer = setInterval(refreshDashboard, 4000);
    }
    if (view === "pseudo") {
      const input = document.getElementById("pseudo-input");
      if (input) input.focus();
    }
  }

  async function attemptFormateurAccess() {
    const ok = await window.ensureFormateurAccess();
    if (ok) goTo("dash");
  }

  /* ---------------------------------------------------------------------
   * Écran d'accueil et fiche pseudo — remplis à partir de LabConfig
   * ------------------------------------------------------------------- */
  function renderLanding() {
    const cfg = window.LabConfig;
    document.title = cfg.title + " — " + (cfg.moduleTag || "Lab interactif");
    document.getElementById("landing-tag").textContent = cfg.moduleTag || "Lab interactif";
    document.getElementById("landing-title").textContent = cfg.title;
    document.getElementById("landing-desc").textContent = cfg.description || "";
    document.getElementById("participant-pitch").textContent = cfg.participantPitch || "";
    document.getElementById("formateur-pitch").textContent = cfg.formateurPitch || "";
    document.getElementById("landing-note").textContent =
      cfg.privacyNote || "Aucune donnée personnelle réelle n'est demandée dans ce lab.";
    document.querySelectorAll(".brand span").forEach((el) => (el.textContent = cfg.title));
  }

  function startGame() {
    pseudo = document.getElementById("pseudo-input").value.trim() || "Participant";
    goTo("game");
    const container = document.getElementById("game-container");
    container.innerHTML = "";
    window.LabConfig.renderGame(container, pseudo);
  }

  // Appelé par le script du lab quand le participant a terminé.
  async function submitResult(customFields) {
    const record = Object.assign({ pseudo, ts: Date.now() }, customFields);
    const container = document.getElementById("summary-container");
    container.innerHTML = "";
    window.LabConfig.renderParticipantSummary(container, record);
    goTo("summary");

    try {
      const key = "resp:" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const result = await window.storage.set(key, JSON.stringify(record), true);
      if (!result) throw new Error("Échec de l'enregistrement (résultat vide)");
      if (result.queued) {
        const note = document.createElement("div");
        note.style.cssText =
          "margin-top:14px; background:#FFF8E8; border:1px dashed #E8D5A3; color:#7A5C1E; font-size:12.5px; padding:10px 14px; border-radius:10px; text-align:left; line-height:1.5;";
        note.textContent =
          "📶 Connexion instable : votre résultat est enregistré sur cet appareil et sera transmis automatiquement au formateur dès que la connexion revient. Rien n'est perdu — pas besoin de recommencer.";
        container.appendChild(note);
      }
    } catch (e) {
      console.error("Erreur d'enregistrement", e);
      const warn = document.createElement("div");
      warn.style.cssText =
        "margin-top:14px; background:#FBEAEA; border:1px dashed #E4A9A3; color:#8A2E27; font-size:12.5px; padding:10px 14px; border-radius:10px; text-align:left; line-height:1.5;";
      warn.textContent =
        "⚠️ Votre résultat personnel ci-dessus reste valable, mais il n'a pas pu être transmis au tableau de bord du formateur (problème de connexion). Signalez-le si cela se reproduit.";
      container.appendChild(warn);
    }
  }

  /* ---------------------------------------------------------------------
   * Partage / QR code (générique, encode toujours l'URL courante)
   * ------------------------------------------------------------------- */
  let qrRendered = false;
  function renderShareBlock() {
    const url = window.location.href.split("?")[0];
    document.getElementById("qr-url").textContent = url;
    const isLocalOrFile = /^file:|localhost|127\.0\.0\.1/.test(url);
    document.getElementById("qr-hint").textContent = isLocalOrFile
      ? "⚠️ Vous consultez cette page en local. Ouvrez plutôt l'adresse GitHub Pages du dépôt pour que ce lien soit accessible depuis n'importe quel téléphone."
      : "Ce lien fonctionne sur n'importe quel téléphone, sans installation.";
    if (!qrRendered && typeof QRCode !== "undefined") {
      try {
        new QRCode(document.getElementById("qr-canvas"), {
          text: url, width: 116, height: 116, colorDark: "#12173F", colorLight: "#ffffff",
        });
        qrRendered = true;
      } catch (e) { console.error("QR non généré", e); }
    }
  }
  function copyShareUrl() {
    const url = window.location.href.split("?")[0];
    navigator.clipboard && navigator.clipboard.writeText(url).then(() => {
      const btn = event.target;
      const old = btn.textContent;
      btn.textContent = "Copié !";
      setTimeout(() => (btn.textContent = old), 1500);
    });
  }

  /* ---------------------------------------------------------------------
   * Tableau de bord formateur — partie générique (liste participants,
   * CSV, réinitialisation) + zone dédiée au contenu spécifique du lab.
   * ------------------------------------------------------------------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function refreshDashboard() {
    const noteEl = document.getElementById("refresh-note");
    try {
      const list = await window.storage.list("resp:", true);
      const keys = (list && list.keys) || [];
      if (keys.length === 0) {
        currentRecords = [];
        document.getElementById("dash-empty").classList.remove("hidden");
        document.getElementById("dash-content").classList.add("hidden");
        document.getElementById("dash-count").textContent = "0";
        noteEl.textContent = "Dernière actualisation : " + new Date().toLocaleTimeString("fr-FR");
        return;
      }
      const records = [];
      for (const k of keys) {
        try {
          const res = await window.storage.get(k, true);
          if (res && res.value) {
            const rec = JSON.parse(res.value);
            rec._key = k;
            records.push(rec);
          }
        } catch (e) { /* ignore single-key failure */ }
      }
      if (records.length === 0) {
        noteEl.textContent = "Dernière actualisation : " + new Date().toLocaleTimeString("fr-FR");
        return;
      }
      currentRecords = records;

      document.getElementById("dash-empty").classList.add("hidden");
      document.getElementById("dash-content").classList.remove("hidden");
      document.getElementById("dash-count").textContent = records.length;

      renderParticipantList(records);

      const extra = document.getElementById("dash-extra");
      extra.innerHTML = "";
      if (typeof window.LabConfig.renderDashboardExtra === "function") {
        window.LabConfig.renderDashboardExtra(extra, records);
      }

      noteEl.textContent =
        "Dernière actualisation : " + new Date().toLocaleTimeString("fr-FR") + " · " + records.length + " réponse(s)";
    } catch (e) {
      console.error("Erreur tableau de bord", e);
      noteEl.textContent = "Actualisation en attente…";
    }
  }

  function renderParticipantList(records) {
    const participantList = document.getElementById("participant-list");
    participantList.innerHTML = "";
    const sorted = [...records].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const badgeFn = window.LabConfig.participantBadge || defaultBadge;

    sorted.forEach((r) => {
      const name = (r.pseudo || "Participant").trim();
      const initial = name.charAt(0).toUpperCase();
      const time = r.ts ? new Date(r.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
      const row = document.createElement("div");
      row.className = "participant-row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px; flex:1; min-width:260px;">
          <div class="participant-avatar">${initial}</div>
          <div class="participant-name">${escapeHtml(name)}</div>
          <div class="participant-time">${time}</div>
        </div>
        <div class="participant-scores">
          ${badgeFn(r)}
          <span style="font-family:var(--mono); font-size:11px; color:var(--gray); margin-left:4px;">↗ détail</span>
        </div>
      `;
      row.addEventListener("click", () => {
        const url = location.pathname + "?pdetail=" + encodeURIComponent(r._key);
        window.open(url, "_blank");
      });
      participantList.appendChild(row);
    });
    if (sorted.length === 0) {
      participantList.innerHTML = '<div class="participant-empty">Aucun participant pour le moment.</div>';
    }
  }

  function defaultBadge(record) {
    return `<span class="score-chip mid">vu</span>`;
  }

  /* ---------------------------------------------------------------------
   * Export CSV — utilise LabConfig.csvColumns si fourni, sinon un export
   * minimal (pseudo + heure) qui fonctionne pour n'importe quel lab.
   * ------------------------------------------------------------------- */
  function exportCsv() {
    if (!currentRecords || currentRecords.length === 0) {
      alert("Aucun résultat à exporter pour le moment.");
      return;
    }
    const cols = (window.LabConfig.csvColumns && window.LabConfig.csvColumns.length)
      ? window.LabConfig.csvColumns
      : [
          { header: "Participant", get: (r) => r.pseudo || "" },
          { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
        ];
    const escapeCsv = (v) => {
      const s = String(v === undefined || v === null ? "" : v);
      return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = cols.map((c) => escapeCsv(c.header)).join(";");
    const rows = currentRecords
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
      .map((r) => cols.map((c) => escapeCsv(c.get(r))).join(";"));
    const csv = "\uFEFF" + [header, ...rows].join("\n"); // \uFEFF = BOM pour Excel/accents
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (window.LabConfig.id || "lab") + "-resultats-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------------------------------------------------------------------
   * Réinitialisation (double confirmation, action irréversible)
   * ------------------------------------------------------------------- */
  async function resetDatabase() {
    const step1 = confirm(
      "Effacer définitivement tous les résultats de cette session pour ce lab ? Cette action est irréversible."
    );
    if (!step1) return;
    const typed = prompt("Pour confirmer, tapez EFFACER en majuscules :");
    if (typed !== "EFFACER") {
      alert("Réinitialisation annulée.");
      return;
    }
    try {
      await window.storage.clear(true);
      await refreshDashboard();
      alert("Les données de cette session ont été effacées.");
    } catch (e) {
      console.error("Erreur de réinitialisation", e);
      alert("La réinitialisation a échoué. Vérifiez votre connexion et réessayez.");
    }
  }

  /* ---------------------------------------------------------------------
   * Vue détail (nouvel onglet dédié, sans rafraîchissement automatique)
   * ------------------------------------------------------------------- */
  async function initDetailViewIfNeeded() {
    const key = new URLSearchParams(location.search).get("pdetail");
    if (!key) return false;

    ["landing", "pseudo", "game", "summary", "dash"].forEach((v) => {
      const el = document.getElementById("view-" + v);
      if (el) el.classList.add("hidden");
    });
    document.getElementById("view-detail").classList.remove("hidden");

    const ok = await window.ensureFormateurAccess();
    if (!ok) {
      document.getElementById("detail-loading").classList.add("hidden");
      document.getElementById("detail-error").classList.remove("hidden");
      document.querySelector("#detail-error .big").textContent = "Accès refusé";
      return true;
    }

    try {
      const res = await window.storage.get(key, true);
      const record = JSON.parse(res.value);
      document.getElementById("detail-name").textContent = record.pseudo || "Participant";
      const body = document.getElementById("detail-body");
      body.innerHTML = "";
      window.LabConfig.renderDetail(body, record);
      document.getElementById("detail-loading").classList.add("hidden");
      document.getElementById("detail-content").classList.remove("hidden");
    } catch (e) {
      console.error("Détail introuvable", e);
      document.getElementById("detail-loading").classList.add("hidden");
      document.getElementById("detail-error").classList.remove("hidden");
    }
    return true;
  }

  /* ---------------------------------------------------------------------
   * Démarrage
   * ------------------------------------------------------------------- */
  async function init() {
    if (!window.LabConfig) {
      console.error("[lab-engine] window.LabConfig est introuvable — le lab doit charger son lab-content.js avant lab-engine.js n'appelle init().");
      return;
    }
    renderLanding();

    const pseudoInput = document.getElementById("pseudo-input");
    if (pseudoInput) {
      pseudoInput.addEventListener("input", (e) => {
        document.getElementById("pseudo-btn").disabled = e.target.value.trim().length === 0;
      });
      pseudoInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.value.trim().length > 0) startGame();
      });
    }

    const handledDetail = await initDetailViewIfNeeded();
    if (handledDetail) return;

    startLockPolling();
  }

  return {
    init, goTo, startGame, submitResult, attemptFormateurAccess,
    copyShareUrl, exportCsv, resetDatabase, escapeHtml,
    gaugeMarkup, bindGauge,
  };
})();

document.addEventListener("DOMContentLoaded", () => LabEngine.init());
