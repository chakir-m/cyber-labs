// module10-detecteur-deepfake/lab-content.js
//
// Lab 1 du Module 10 : "Détecter un deepfake potentiel". Un scénario unique
// (appel vidéo du faux directeur financier, inspiré du cas Arup), 6
// caractéristiques proposées dont 3 sont de VRAIS signaux d'alerte et 3 des
// distracteurs rassurants qui ne prouvent rien — même mécanique que
// Anatomie du Phishing (Module 4). Le point pédagogique central : une voix
// ou une image convaincante n'est plus une preuve d'identité suffisante.

const CALL_TEXT =
  "Un collaborateur du service comptabilité reçoit un appel en visioconférence dont la voix, l'intonation et les expressions correspondent parfaitement à celles de son directeur financier, lui demandant un virement urgent et confidentiel. Pendant l'appel, l'éclairage du visage du directeur semble légèrement incohérent avec le reste de la pièce, et il évite de tourner franchement la tête vers la caméra.";

const ITEMS = [
  { key: "eclairage", label: "L'éclairage du visage semble incohérent avec le reste de la pièce visible à l'écran", isSignal: true, explanation: "Les incohérences lumineuses entre le visage généré et l'arrière-plan réel restent, à ce jour, l'une des limites techniques les plus fréquentes des deepfakes en temps réel." },
  { key: "tete", label: "L'interlocuteur évite de tourner franchement la tête vers la caméra", isSignal: true, explanation: "Les mouvements de tête prononcés ou les changements d'angle brusques sont plus difficiles à reproduire fidèlement pour un deepfake en direct — l'évitement de ces mouvements est un signal d'alerte connu." },
  { key: "urgence", label: "La demande porte sur un virement urgent et confidentiel", isSignal: true, explanation: "L'urgence et la confidentialité reproduisent exactement le schéma de la fraude au président : ces deux ingrédients à eux seuls justifient une vérification, indépendamment de toute question technique sur l'image." },
  { key: "voix", label: "La voix correspond parfaitement aux intonations et à l'accent habituels du directeur financier", isSignal: false, explanation: "Ce n'est PAS un signal fiable : c'est précisément l'objectif d'un deepfake vocal de reproduire fidèlement une voix connue. Une voix reconnaissable n'est plus une preuve d'identité suffisante." },
  { key: "camera", label: "L'appel se déroule en visioconférence avec la caméra activée, pas par simple appel audio", isSignal: false, explanation: "La présence d'une image ne garantit rien : le cas Arup a précisément impliqué une visioconférence avec plusieurs participants, tous des deepfakes. L'image ne remplace pas la vérification indépendante." },
  { key: "details", label: "L'interlocuteur mentionne des détails internes exacts sur un projet en cours dans l'entreprise", isSignal: false, explanation: "Ce n'est PAS une preuve de légitimité : ces informations peuvent avoir été collectées au préalable par l'attaquant (réseaux sociaux, e-mails compromis, ingénierie sociale), exactement comme pour un spear phishing bien préparé." },
];

let chosen = new Set();

window.LabConfig = {
  id: "module10-detecteur-deepfake",
  title: "Détecteur de Deepfake",
  moduleTag: "Module 10 · Lab interactif",
  description:
    "Un appel vidéo suspect, six caractéristiques proposées : cochez celles qui sont de VRAIS signaux d'alerte face à un deepfake potentiel. Une voix ou une image convaincante ne prouve plus rien à elle seule.",
  participantPitch: "Examinez un appel vidéo simulé et identifiez les vrais signaux d'alerte parmi 6 propositions, en 5 minutes.",
  formateurPitch: "Voyez en direct quels éléments sont le plus souvent mal classés — signal manqué ou fausse assurance.",
  privacyNote: "Aucune donnée personnelle n'est demandée : seule votre sélection parmi les 6 éléments est enregistrée.",

  renderGame(container, pseudo) {
    chosen = new Set();
    renderCallScreen(container);
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
          <strong>À retenir :</strong> une voix reconnaissable, une image en direct ou des détails internes exacts ne prouvent plus l'identité de votre interlocuteur — seule une vérification par un second canal totalement indépendant de l'appel, déjà connu à l'avance, protège réellement avant tout virement ou décision sensible.
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

/* ============ Écran unique : appel simulé + checklist ============ */
function renderCallScreen(container) {
  const itemsHtml = ITEMS.map(
    (it) => `
      <button class="toggle-btn item-btn" data-key="${it.key}" style="text-align:left; justify-content:flex-start; background:var(--paper); color:var(--navy); border:1.5px solid #DCD7C8; padding:12px 14px; flex:none; width:100%; display:block;">
        <span style="display:inline-block; width:20px;">☐</span> ${LabEngine.escapeHtml(it.label)}
      </button>`
  ).join("");

  container.innerHTML = `
    <div class="card-shell fade-in" style="max-width:560px; margin:0 auto;">
      <span class="eyebrow">L'appel vidéo</span>
      <div style="background:var(--paper); border:1.5px solid #DCD7C8; border-radius:12px; padding:16px 18px; margin:12px 0 20px; font-size:13.5px; line-height:1.6; color:var(--ink);">
        ${LabEngine.escapeHtml(CALL_TEXT)}
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
