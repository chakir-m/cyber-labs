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
    "Un appel vidéo à examiner directement : cliquez sur les éléments de la visioconférence elle-même qui constituent, selon vous, de VRAIS signaux d'alerte face à un deepfake potentiel. Une voix ou une image convaincante ne prouve plus rien à elle seule.",
  participantPitch: "Examinez un appel vidéo simulé en cliquant directement sur ses éléments pour repérer les vrais signaux d'alerte, en 5 minutes.",
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

/* ============ Écran unique : visio interactive à zones cliquables ============ */
function hotspot(key, innerHtml, extraStyle) {
  return `<span class="call-hotspot" data-key="${key}" style="${extraStyle || ""}">${innerHtml}</span>`;
}

function renderCallScreen(container) {
  container.innerHTML = `
    <div class="card-shell fade-in" style="max-width:560px; margin:0 auto;">
      <span class="eyebrow">L'appel vidéo</span>
      <p class="desc" style="margin:6px 0 16px;">Cliquez directement sur les éléments de cette visioconférence qui constituent, selon vous, de <strong>VRAIS signaux d'alerte</strong>. Un élément peut sembler rassurant sans en être un.</p>

      <div class="video-frame" style="position:relative; border-radius:14px; overflow:hidden; background:linear-gradient(90deg, rgba(255,196,120,.35) 0%, rgba(30,39,97,.9) 45%, rgba(120,170,255,.35) 100%), var(--navy-dark); height:230px; margin-bottom:14px;">
        ${hotspot("eclairage", `<span style="cursor:pointer; display:block; width:100%; height:100%;" title="Éclairage du visage"></span>`, "position:absolute; inset:0; z-index:1;")}

        ${hotspot("camera", `<span style="display:inline-flex; align-items:center; gap:5px; background:rgba(0,0,0,.35); color:#fff; font-family:var(--mono); font-size:10.5px; padding:4px 9px; border-radius:20px; cursor:pointer;">🔴 EN DIRECT</span>`, "position:absolute; top:10px; left:10px; z-index:2;")}

        <!-- Visage stylisé -->
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-52%); text-align:center; z-index:1; pointer-events:none;">
          <div style="position:relative; width:96px; height:96px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #F0C9A0, #D9A876); margin:0 auto; box-shadow:0 6px 18px rgba(0,0,0,.3);">
            <div style="position:absolute; top:38px; left:24px; width:9px; height:9px; border-radius:50%; background:#3A2A20;"></div>
            <div style="position:absolute; top:38px; right:24px; width:9px; height:9px; border-radius:50%; background:#3A2A20;"></div>
            <div style="position:absolute; bottom:26px; left:50%; transform:translateX(-50%); width:26px; height:10px; border-radius:0 0 14px 14px; background:#B5714E;"></div>
          </div>
          <div style="color:var(--ice); font-size:11px; font-family:var(--mono); margin-top:8px;">Directeur Financier</div>
        </div>

        ${hotspot("tete", `<span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:rgba(0,0,0,.35); color:var(--gold-light); font-size:13px; cursor:pointer;">↻</span>`, "position:absolute; top:36px; right:calc(50% - 78px); z-index:2;")}

        ${hotspot("voix", `<span style="display:inline-flex; align-items:center; gap:5px; background:rgba(0,0,0,.35); color:#fff; font-family:var(--mono); font-size:10.5px; padding:4px 9px; border-radius:20px; cursor:pointer;">🔊 Voix reconnaissable</span>`, "position:absolute; bottom:10px; left:10px; z-index:2;")}

        ${hotspot("details", `<span style="display:inline-flex; align-items:center; gap:5px; background:rgba(0,0,0,.35); color:#fff; font-family:var(--mono); font-size:10px; padding:4px 8px; border-radius:20px; cursor:pointer;">💬 Détails projet</span>`, "position:absolute; top:10px; right:10px; z-index:2;")}
      </div>

      ${hotspot("urgence", `<div style="background:var(--paper); border:1.5px solid #DCD7C8; border-radius:10px; padding:12px 14px; cursor:pointer; font-size:13px; color:var(--ink); line-height:1.5;">🗨️ « J'ai besoin que vous traitiez un <strong>virement urgent et confidentiel</strong> avant la fin de la journée, sans en parler à l'équipe pour l'instant. »</div>`, "display:block; margin-bottom:20px;")}

      <p class="desc" style="font-size:12.5px; color:var(--gray);">💡 Astuce : touchez ou survolez chaque zone de l'appel — le curseur change pour signaler qu'elle est cliquable. La zone « visage » couvre tout l'éclairage de l'image.</p>

      <button class="btn-primary" id="validate-btn" style="margin-top:16px;">Valider ma sélection</button>
      <div id="feedback-zone" style="margin-top:16px;"></div>
    </div>

    <style>
      .call-hotspot[data-key="eclairage"] span{ transition: box-shadow .15s ease; }
      .call-hotspot[data-key="eclairage"].selected span{ box-shadow: inset 0 0 0 3px var(--gold); background:rgba(201,162,75,.15); }
      .call-hotspot[data-key="tete"] span, .call-hotspot[data-key="camera"] span, .call-hotspot[data-key="voix"] span, .call-hotspot[data-key="details"] span{ transition: background .15s ease, color .15s ease; }
      .call-hotspot[data-key="tete"].selected span, .call-hotspot[data-key="camera"].selected span, .call-hotspot[data-key="voix"].selected span, .call-hotspot[data-key="details"].selected span{ background:var(--gold) !important; color:var(--navy-dark) !important; }
      .call-hotspot[data-key="urgence"] > div{ transition: background .15s ease, border-color .15s ease; }
      .call-hotspot[data-key="urgence"].selected > div{ background:var(--navy) !important; color:#fff !important; border-color:var(--navy) !important; }
    </style>
  `;

  chosen = new Set();
  container.querySelectorAll(".call-hotspot").forEach((el) => {
    el.onclick = (e) => {
      e.stopPropagation();
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

  container.querySelectorAll(".call-hotspot").forEach((el) => { el.onclick = null; el.style.pointerEvents = "none"; });
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
