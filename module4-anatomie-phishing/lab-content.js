// module4-anatomie-phishing/lab-content.js
//
// Lab 1 du Module 4 : "Analysez cet e-mail de phishing". Contrairement aux
// quiz précédents (une bonne réponse par situation), ce lab présente UN SEUL
// e-mail simulé et demande de cocher, parmi 8 éléments proposés, lesquels
// sont de VRAIS signaux d'alerte — sachant que 4 sont de vrais signaux et 4
// sont des distracteurs (des caractéristiques neutres, presque rassurantes,
// qu'il ne faut pas confondre avec un signal). Le score est calculé élément
// par élément (bien classé = 1 point), sur 8 au total — cela pénalise autant
// la sur-suspicion que le signal manqué.

const EMAIL_TEXT = {
  expediteur: "Support IT <it-support@votre-entreprise-corp.com>",
  objetMenace: "Votre boîte mail sera suspendue",
  objetDelai: "dans 2 heures",
  recu: "Reçu aujourd'hui à 14:32 (mardi)",
  corpsIntro: "Cher collaborateur,\n\nNotre système a détecté un dépassement de votre quota de messagerie.",
  corpsAction: "Cliquez ici immédiatement pour valider votre espace de stockage et éviter la suspension de votre compte.",
  lienAffiche: "www.votre-entreprise.com/valider",
  lienReel: "hxxp://secure-mailquota-verify.ru/valider-acces",
};

const ITEMS = [
  { key: "expediteur", label: "L'adresse d'expéditeur contient « -corp », légèrement différente du domaine habituel de l'entreprise", isSignal: true, explanation: "Un domaine d'expéditeur qui ressemble à s'y méprendre à l'original (avec un ajout discret) est l'un des cinq ingrédients classiques du phishing — c'est souvent le signal le plus fiable, mais aussi le plus facile à manquer si on ne vérifie pas l'adresse complète." },
  { key: "delai", label: "Le message impose un délai très court (2 heures) avant une conséquence négative", isSignal: true, explanation: "Le ton pressant avec un délai artificiellement court est un ressort psychologique classique : il pousse à agir avant de vérifier, en cour-circuitant la réflexion." },
  { key: "menace", label: "Le message menace de suspendre le compte en cas d'inaction", isSignal: true, explanation: "La menace implicite (perte d'accès, sanction) est un autre ressort classique de l'ingénierie sociale, souvent combiné à l'urgence." },
  { key: "lien", label: "Le lien affiché dans le message diffère de l'adresse réelle une fois qu'on la survole", isSignal: true, explanation: "La divergence entre le lien affiché et la destination réelle est la preuve technique la plus fiable d'un e-mail frauduleux — c'est ce qu'il faut vérifier systématiquement avant de cliquer." },
  { key: "orthographe", label: "Le message est rédigé en français correct, sans faute d'orthographe visible", isSignal: false, explanation: "Ce n'est PAS un signal fiable : les campagnes de phishing récentes sont souvent rédigées avec un soin quasi professionnel. L'absence de fautes ne garantit absolument pas la légitimité d'un message." },
  { key: "signature", label: "Le message est signé « Le Support IT »", isSignal: false, explanation: "Une signature plausible ne prouve rien : n'importe qui peut signer un message de cette façon. Ce n'est ni un signal d'alerte, ni une garantie de légitimité en soi." },
  { key: "logo", label: "Le message reprend la mise en forme habituelle des communications internes", isSignal: false, explanation: "Une mise en forme soignée et familière est facilement imitable et ne constitue pas un signal fiable — beaucoup de faux messages reproduisent fidèlement l'apparence des communications légitimes." },
  { key: "jour", label: "Le message a été reçu un jour ouvré, pendant les heures de bureau", isSignal: false, explanation: "Le moment de réception d'un message n'a aucune valeur de signal : les campagnes de phishing sont souvent programmées précisément pendant les heures de bureau pour se fondre dans le flux normal de messages." },
];

let chosen = new Set();

window.LabConfig = {
  id: "module4-anatomie-phishing",
  title: "Anatomie du Phishing",
  moduleTag: "Module 4 · Lab interactif",
  description:
    "Un e-mail suspect à examiner directement : cliquez sur les éléments de l'e-mail lui-même qui constituent, selon vous, de VRAIS signaux d'alerte. Attention, certains éléments semblent rassurants mais ne prouvent rien.",
  participantPitch: "Examinez un e-mail simulé en cliquant directement dessus pour repérer les vrais signaux d'alerte, en 5 minutes.",
  formateurPitch: "Voyez en direct quels éléments sont le plus souvent mal classés — signal manqué ou fausse alerte.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seule votre sélection parmi les 8 éléments est enregistrée.",

  renderGame(container, pseudo) {
    chosen = new Set();
    renderEmailScreen(container);
  },

  renderParticipantSummary(container, record) {
    const pct = Math.round((record.score / record.total) * 100);
    const missed = (record.details || []).filter((d) => !d.correct);
    let missedHtml = "";
    if (missed.length > 0) {
      missedHtml = `
        <div class="summary-msg" style="margin-top:14px;">
          <strong>À revoir :</strong> ${missed.length} élément(s) mal classé(s) — le débrief collectif y reviendra en détail.
        </div>`;
    }
    container.innerHTML = `
      <div class="summary-wrap fade-in">
        <span class="eyebrow">Votre résultat</span>
        <div class="big-number">${record.score}<span class="unit">/ ${record.total} éléments bien classés (${pct}%)</span></div>
        <div class="summary-msg">
          <strong>À retenir :</strong> un e-mail de phishing efficace ne comporte pas nécessairement de fautes d'orthographe, ni d'apparence négligée — les signaux les plus fiables restent l'adresse d'expéditeur exacte et la destination réelle d'un lien, pas l'impression générale du message.
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
    const perItem = {};
    ITEMS.forEach((it) => (perItem[it.key] = { correct: 0, total: 0 }));
    records.forEach((r) => {
      (r.details || []).forEach((d) => {
        if (!perItem[d.key]) return;
        perItem[d.key].total++;
        if (d.correct) perItem[d.key].correct++;
      });
    });
    const rows = ITEMS.map((it) => {
      const p = perItem[it.key];
      const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
      return { it, pct, total: p.total };
    }).sort((a, b) => a.pct - b.pct);

    let barsHtml = "";
    rows.forEach((r) => {
      const cls = r.pct >= 80 ? "low" : r.pct >= 50 ? "mid" : "high";
      barsHtml += `
        <div class="bar-row">
          <div class="bar-label">${r.it.label.length > 50 ? r.it.label.slice(0, 47) + "…" : r.it.label}<span class="bar-cat">${r.it.isSignal ? "Vrai signal" : "Distracteur"}</span></div>
          <div class="bar-track"><div class="bar-seg ${cls}" style="width:${r.pct}%"></div></div>
          <div class="bar-pct">${r.total > 0 ? r.pct + "%" : "—"}</div>
        </div>`;
    });

    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${avgScore.toFixed(1)} / ${ITEMS.length}</div><div class="l">Score moyen du groupe</div></div>
      </div>
      <div class="section-title">Éléments les plus souvent mal classés</div>
      <div>${barsHtml}</div>
    `;
  },

  renderDetail(container, record) {
    const rows = (record.details || [])
      .map((d) => {
        const it = ITEMS.find((x) => x.key === d.key);
        return `
        <div style="padding:10px 0; border-bottom:1px solid #EDEAE0;">
          <div style="font-size:12.5px; color:var(--ink); margin-bottom:6px;">${LabEngine.escapeHtml(it.label)}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <span class="score-chip ${d.correct ? "low" : "high"}">${d.correct ? "✓ Bien classé" : "✗ Mal classé"}</span>
            <span style="font-family:var(--mono); font-size:11px; color:var(--gray);">${d.selected ? "Coché comme signal" : "Non coché"} — attendu : ${it.isSignal ? "signal" : "distracteur"}</span>
          </div>
        </div>`;
      })
      .join("");
    container.innerHTML = `
      <div class="stat-row">
        <div class="stat-card accent"><div class="n">${record.score} / ${record.total}</div><div class="l">Score final</div></div>
      </div>
      <div class="section-title">Détail élément par élément</div>
      <div>${rows}</div>
    `;
  },

  csvColumns: [
    { header: "Participant", get: (r) => r.pseudo || "" },
    { header: "Score", get: (r) => (r.score || 0) + "/" + (r.total || 0) },
    { header: "Horodatage", get: (r) => (r.ts ? new Date(r.ts).toLocaleString("fr-FR") : "") },
    ...ITEMS.map((it) => ({
      header: it.key,
      get: (r) => {
        const d = (r.details || []).find((x) => x.key === it.key);
        return d ? (d.correct ? "Correct" : "Incorrect") : "";
      },
    })),
  ],
};

/* ============ Écran unique : e-mail interactif à zones cliquables ============ */
function hotspot(key, innerHtml) {
  return `<span class="email-hotspot" data-key="${key}">${innerHtml}</span>`;
}

function renderEmailScreen(container) {
  container.innerHTML = `
    <div class="card-shell fade-in" style="max-width:560px; margin:0 auto;">
      <span class="eyebrow">L'e-mail reçu</span>
      <p class="desc" style="margin:6px 0 16px;">Cliquez directement sur les éléments de l'e-mail ci-dessous qui constituent, selon vous, de <strong>VRAIS signaux d'alerte</strong>. Un élément peut sembler rassurant sans en être un.</p>

      <div class="email-window" style="border:1.5px solid #DCD7C8; border-radius:12px; overflow:hidden; font-size:13px; line-height:1.6; margin-bottom:20px;">
        <div class="email-topbar" style="background:var(--navy); color:#fff; padding:10px 16px; display:flex; align-items:center; gap:10px;">
          ${hotspot("logo", `<span style="font-family:var(--serif); font-weight:600; font-size:13.5px; cursor:pointer; border-radius:6px; padding:3px 8px;">🏢 Votre-Entreprise — Communication interne</span>`)}
        </div>
        <div style="background:#fff; padding:16px 18px;">
          <div style="margin-bottom:6px;">
            <strong>De :</strong> ${hotspot("expediteur", `<span style="font-family:var(--mono); font-size:12px; cursor:pointer; border-radius:4px; padding:2px 5px;">${LabEngine.escapeHtml(EMAIL_TEXT.expediteur)}</span>`)}
          </div>
          <div style="margin-bottom:6px;">
            <strong>Objet :</strong> Action requise — ${hotspot("menace", `<span style="cursor:pointer; border-radius:4px; padding:2px 5px;">${LabEngine.escapeHtml(EMAIL_TEXT.objetMenace)}</span>`)} ${hotspot("delai", `<span style="cursor:pointer; border-radius:4px; padding:2px 5px;">${LabEngine.escapeHtml(EMAIL_TEXT.objetDelai)}</span>`)}
          </div>
          <div style="margin-bottom:14px;">
            ${hotspot("jour", `<span style="font-family:var(--mono); font-size:11px; color:var(--gray); cursor:pointer; border-radius:4px; padding:2px 5px;">🕐 ${LabEngine.escapeHtml(EMAIL_TEXT.recu)}</span>`)}
          </div>
          <div style="border-top:1px dashed #E4E0D5; padding-top:12px;">
            ${hotspot("orthographe", `<span style="cursor:pointer; border-radius:6px; padding:4px 6px; display:inline;">${LabEngine.escapeHtml(EMAIL_TEXT.corpsIntro)} ${LabEngine.escapeHtml(EMAIL_TEXT.corpsAction)}</span>`)}
          </div>
          <div style="margin-top:14px; padding:10px 12px; background:var(--paper); border-radius:8px;">
            <div><strong>Lien affiché :</strong></div>
            ${hotspot("lien", `<span style="cursor:pointer; border-radius:4px; padding:2px 5px; display:inline-block; margin-top:2px;">${LabEngine.escapeHtml(EMAIL_TEXT.lienAffiche)}</span>`)}
            <div style="margin-top:6px; font-family:var(--mono); font-size:11px; color:var(--high);">Lien réel (au survol) : ${LabEngine.escapeHtml(EMAIL_TEXT.lienReel)}</div>
          </div>
          <div style="margin-top:14px;">
            Cordialement,<br>
            ${hotspot("signature", `<span style="cursor:pointer; border-radius:4px; padding:2px 5px;">Le Support IT</span>`)}
          </div>
        </div>
      </div>

      <p class="desc" style="font-size:12.5px; color:var(--gray);">💡 Astuce : touchez ou survolez chaque zone de l'e-mail — le curseur change pour signaler qu'elle est cliquable.</p>

      <button class="btn-primary" id="validate-btn" style="margin-top:16px;">Valider ma sélection</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>

    <style>
      .email-hotspot span{ transition: background .15s ease, color .15s ease; }
      .email-hotspot span:hover{ background:var(--gold-light) !important; }
      .email-hotspot.selected span{ background:var(--navy) !important; color:#fff !important; }
      .email-topbar .email-hotspot.selected span{ background:var(--gold) !important; color:var(--navy-dark) !important; }
    </style>
  `;

  chosen = new Set();
  container.querySelectorAll(".email-hotspot").forEach((el) => {
    el.onclick = () => {
      const key = el.dataset.key;
      if (chosen.has(key)) {
        chosen.delete(key);
        el.classList.remove("selected");
      } else {
        chosen.add(key);
        el.classList.add("selected");
      }
    };
  });

  document.getElementById("validate-btn").onclick = () => {
    finishGame(container);
  };
}

function finishGame(container) {
  const details = ITEMS.map((it) => {
    const selected = chosen.has(it.key);
    const correct = selected === it.isSignal;
    return { key: it.key, selected, correct };
  });
  const score = details.filter((d) => d.correct).length;

  container.querySelectorAll(".email-hotspot").forEach((el) => { el.onclick = null; el.style.pointerEvents = "none"; });
  document.getElementById("validate-btn").disabled = true;
  const zone = document.getElementById("feedback-zone");
  const explHtml = ITEMS.map((it) => {
    const d = details.find((x) => x.key === it.key);
    return `<div style="padding:8px 0; border-bottom:1px solid #EDEAE0; font-size:12.5px;">
      <span style="color:${d.correct ? "var(--low)" : "var(--high)"}; font-weight:700;">${d.correct ? "✓" : "✗"}</span>
      ${LabEngine.escapeHtml(it.label)} — <em>${LabEngine.escapeHtml(it.explanation)}</em>
    </div>`;
  }).join("");
  zone.innerHTML = `
    <div style="background:#F5F3EE; border-radius:12px; padding:14px 16px; margin-bottom:12px;">
      <div style="font-weight:700; color:var(--navy); margin-bottom:8px;">${score} / ${ITEMS.length} éléments bien classés</div>
      ${explHtml}
    </div>
    <button class="btn-next" style="width:100%;" id="finish-btn">Voir mon résultat →</button>
  `;
  document.getElementById("finish-btn").onclick = () => {
    LabEngine.submitResult({ score, total: ITEMS.length, details });
  };
}
