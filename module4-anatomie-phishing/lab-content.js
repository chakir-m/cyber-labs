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
  objet: "Action requise — Votre boîte mail sera suspendue dans 2 heures",
  corps:
    "Cher collaborateur,\n\nNotre système a détecté un dépassement de votre quota de messagerie. " +
    "Cliquez ici immédiatement pour valider votre espace de stockage et éviter la suspension de votre compte.\n\n" +
    "Cordialement,\nLe Support IT",
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
    "Un e-mail suspect, huit caractéristiques proposées : à vous de cocher celles qui sont de VRAIS signaux d'alerte. Attention, certaines caractéristiques semblent rassurantes mais ne prouvent rien.",
  participantPitch: "Examinez un e-mail simulé et identifiez les vrais signaux d'alerte parmi 8 propositions, en 5 minutes.",
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

/* ============ Écran unique : e-mail simulé + checklist ============ */
function renderEmailScreen(container) {
  const itemsHtml = ITEMS.map(
    (it) => `
      <button class="toggle-btn item-btn" data-key="${it.key}" style="text-align:left; justify-content:flex-start; background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; padding:12px 14px; flex:none; width:100%; display:block;">
        <span style="display:inline-block; width:20px;">☐</span> ${LabEngine.escapeHtml(it.label)}
      </button>`
  ).join("");

  container.innerHTML = `
    <div class="card-shell fade-in" style="max-width:560px; margin:0 auto;">
      <span class="eyebrow">L'e-mail reçu</span>
      <div style="background:var(--paper); border:1.5px solid #DCD7C8; border-radius:12px; padding:16px 18px; margin:12px 0 20px; font-size:13px; line-height:1.6;">
        <div><strong>De :</strong> ${LabEngine.escapeHtml(EMAIL_TEXT.expediteur)}</div>
        <div><strong>Objet :</strong> ${LabEngine.escapeHtml(EMAIL_TEXT.objet)}</div>
        <div style="margin-top:10px; white-space:pre-line;">${LabEngine.escapeHtml(EMAIL_TEXT.corps)}</div>
        <div style="margin-top:10px;"><strong>Lien affiché :</strong> ${LabEngine.escapeHtml(EMAIL_TEXT.lienAffiche)}<br><strong>Lien réel (au survol) :</strong> <span style="color:var(--high); font-family:var(--mono); font-size:11.5px;">${LabEngine.escapeHtml(EMAIL_TEXT.lienReel)}</span></div>
      </div>

      <p class="desc">Cochez les éléments ci-dessous qui constituent, selon vous, de <strong>VRAIS signaux d'alerte</strong> :</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">${itemsHtml}</div>

      <button class="btn-primary" id="validate-btn">Valider ma sélection</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>
  `;

  container.querySelectorAll(".item-btn").forEach((b) => {
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

  container.querySelectorAll(".item-btn, #validate-btn").forEach((b) => (b.disabled = true));
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
