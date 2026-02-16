(function () {
  const urlsPagesApmep = {
    "2025": "https://www.apmep.fr/IMG/pdf/Annee_spe_2025_DV_4.pdf",
    "2024": "https://www.apmep.fr/IMG/pdf/Spe_annee_2024_DV_FH4.pdf",
    "2023": "https://www.apmep.fr/IMG/pdf/annee_2023_spe_DV.pdf",
    "2022": "https://www.apmep.fr/IMG/pdf/annee_2022_spe_DV.pdf"
  };

  const PREFIX_STORAGE = "sujets-traites-appreciation";
  const PREFIX_THEMES = "sujets-traites-themes";
  const PREFIX_FAIT = "sujets-traites-fait";

  function cle(annee, nomSujet, numExo) {
    return annee + "|" + nomSujet + "|" + numExo;
  }

  function getFait(annee, nomSujet, numExo) {
    try {
      return localStorage.getItem(PREFIX_FAIT + "|" + cle(annee, nomSujet, numExo)) === "1";
    } catch (e) {
      return false;
    }
  }

  function setFait(annee, nomSujet, numExo, value) {
    try {
      if (value) {
        localStorage.setItem(PREFIX_FAIT + "|" + cle(annee, nomSujet, numExo), "1");
      } else {
        localStorage.removeItem(PREFIX_FAIT + "|" + cle(annee, nomSujet, numExo));
      }
    } catch (e) {}
    syncProgressSnapshot(annee, nomSujet, numExo);
  }

  function getAppreciation(annee, nomSujet, numExo) {
    try {
      return localStorage.getItem(PREFIX_STORAGE + "|" + cle(annee, nomSujet, numExo)) || "";
    } catch (e) {
      return "";
    }
  }

  function setAppreciation(annee, nomSujet, numExo, texte) {
    try {
      localStorage.setItem(PREFIX_STORAGE + "|" + cle(annee, nomSujet, numExo), texte);
    } catch (e) {}
    syncProgressSnapshot(annee, nomSujet, numExo);
  }

  function getThemesOverride(annee, nomSujet, numExo) {
    try {
      var raw = localStorage.getItem(PREFIX_THEMES + "|" + cle(annee, nomSujet, numExo));
      if (raw === null) return null;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (e) {
      return null;
    }
  }

  function setThemesOverride(annee, nomSujet, numExo, themes) {
    try {
      localStorage.setItem(PREFIX_THEMES + "|" + cle(annee, nomSujet, numExo), JSON.stringify(themes));
    } catch (e) {}
    syncProgressSnapshot(annee, nomSujet, numExo);
  }

  function syncProgressSnapshot(annee, nomSujet, numExo) {
    if (!window.AUTH_USER) return;
    try {
      var fait = getFait(annee, nomSujet, numExo);
      var appreciation = getAppreciation(annee, nomSujet, numExo);
      var themes = getThemesOverride(annee, nomSujet, numExo);
      var payload = {
        annee: annee,
        sujet_nom: nomSujet,
        exo_num: numExo,
        fait: fait ? 1 : 0,
        appreciation: appreciation,
        themes: themes
      };
      fetch("user_progress.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      }).catch(function () { });
    } catch (e) { }
  }

  function clearLocalProgress() {
    try {
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (
          k.indexOf(PREFIX_FAIT + "|") === 0 ||
          k.indexOf(PREFIX_STORAGE + "|") === 0 ||
          k.indexOf(PREFIX_THEMES + "|") === 0
        ) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) { }
  }

  function chargerProgressionServeur() {
    if (!window.AUTH_USER) return;
    fetch("user_progress.php", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : { ok: false }; })
      .then(function (data) {
        if (!data || !data.ok || !Array.isArray(data.items)) return;
        clearLocalProgress();
        data.items.forEach(function (item) {
          var an = item.annee;
          var sujet = item.sujet_nom;
          var ex = item.exo_num;
          var keyBase = cle(an, sujet, ex);
          try {
            if (item.fait) {
              localStorage.setItem(PREFIX_FAIT + "|" + keyBase, "1");
            }
            if (item.appreciation && item.appreciation !== "") {
              localStorage.setItem(PREFIX_STORAGE + "|" + keyBase, item.appreciation);
            }
            if (item.themes_json) {
              localStorage.setItem(PREFIX_THEMES + "|" + keyBase, item.themes_json);
            }
          } catch (e) { }
        });

        var anneeActuelle = selectAnnee.value;
        if (donneesGlobales && donneesGlobales[anneeActuelle]) {
          construireTableau(anneeActuelle, donneesGlobales[anneeActuelle]);
          initClicsCellules();
        }
      })
      .catch(function () { });
  }

  const selectAnnee = document.getElementById("select-annee-traites");
  const tableWrapper = document.getElementById("sujets-traites-table-wrapper");
  const messageEl = document.getElementById("sujets-traites-message");
  const tableEl = document.getElementById("sujets-traites-table");
  const modal = document.getElementById("sujets-traites-modal");
  const modalTitre = document.getElementById("modal-titre");
  const modalExo = document.getElementById("modal-exo");
  const modalThemesEdit = document.getElementById("modal-themes-edit");
  const modalNewTheme = document.getElementById("modal-new-theme");
  const modalBtnAddTheme = document.getElementById("modal-btn-add-theme");
  const modalAppreciation = document.getElementById("modal-appreciation");
  const modalBtnFermer = document.getElementById("modal-btn-fermer");
  const modalBtnEnregistrer = document.getElementById("modal-btn-enregistrer");
  const modalClose = document.querySelector(".sujets-traites-modal-close");
  const modalOverlay = document.querySelector(".sujets-traites-modal-overlay");

  let donneesGlobales = null;
  let contexteModal = { annee: "", nomSujet: "", numExo: 1, themes: [] };

  /**
   * Groupe les exercices par sujet et associe les thèmes aux bons exercices.
   * Chaque sujet du sommaire correspond à 4 pages consécutives dans le PDF ;
   * on trie par numéro de page pour avoir Exercice 1 = 1re page du sujet, etc.
   */
  function grouperExercicesParSujet(exercices) {
    const parSujet = {};
    exercices.forEach(function (ex) {
      if (ex.sujet === "Sommaire") return;
      if (!parSujet[ex.sujet]) parSujet[ex.sujet] = [];
      parSujet[ex.sujet].push({ page: ex.page, themes: ex.themes || [] });
    });
    Object.keys(parSujet).forEach(function (sujet) {
      parSujet[sujet].sort(function (a, b) { return a.page - b.page; });
      parSujet[sujet] = parSujet[sujet].slice(0, 4);
    });
    return parSujet;
  }

  function construireTableau(annee, data) {
    if (!data || !data.sommaire || !data.exercices) {
      messageEl.textContent = "Aucune donnée pour cette année.";
      tableEl.style.display = "none";
      return;
    }

    const sujetsOrdre = data.sommaire.filter(function (s) { return s.nom !== "Sommaire"; });
    const parSujet = grouperExercicesParSujet(data.exercices);
    const baseUrl = urlsPagesApmep[annee] || "";

    tableEl.innerHTML = "";
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    var thSujet = document.createElement("th");
    thSujet.textContent = "Sujet";
    thSujet.style.minWidth = "140px";
    trHead.appendChild(thSujet);
    for (var h = 1; h <= 4; h++) {
      const th = document.createElement("th");
      th.textContent = "Exercice " + h;
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    tableEl.appendChild(thead);

    const tbody = document.createElement("tbody");
    sujetsOrdre.forEach(function (s) {
      const tr = document.createElement("tr");
      const tdSujet = document.createElement("td");
      tdSujet.style.fontWeight = "600";
      tdSujet.style.background = "#f0f2f5";
      const nom = document.createElement("div");
      nom.className = "sujets-traites-sujet-nom";
      nom.textContent = s.nom;
      tdSujet.appendChild(nom);
      if (baseUrl && s.page) {
        const lien = document.createElement("a");
        lien.className = "sujets-traites-sujet-lien";
        lien.href = baseUrl + "#page=" + s.page;
        lien.target = "_blank";
        lien.rel = "noopener noreferrer";
        lien.textContent = "Sujet complet";
        tdSujet.appendChild(lien);
      }
      tr.appendChild(tdSujet);

      const exos = parSujet[s.nom] || [];
      for (var exoNum = 1; exoNum <= 4; exoNum++) {
        const exo = exos[exoNum - 1];
        const defaut = (exo && exo.themes && exo.themes.length) ? exo.themes : [];
        const themes = getThemesOverride(annee, s.nom, exoNum) || defaut;
        const td = document.createElement("td");
        td.className = "sujets-traites-cell";
        const contenu = document.createElement("div");
        contenu.className = "sujets-traites-cell-content";
        if (themes.length) {
          const wrap = document.createElement("div");
          wrap.className = "sujets-traites-cell-themes";
          var maxVisible = 3;
          themes.slice(0, maxVisible).forEach(function (th) {
            const tag = document.createElement("span");
            tag.className = "sujets-traites-theme-tag";
            tag.textContent = th;
            wrap.appendChild(tag);
          });
          if (themes.length > maxVisible) {
            const plus = document.createElement("span");
            plus.className = "sujets-traites-theme-plus";
            plus.textContent = "+" + (themes.length - maxVisible);
            wrap.appendChild(plus);
          }
          contenu.appendChild(wrap);
        } else {
          const vide = document.createElement("span");
          vide.className = "sujets-traites-cell-vide";
          vide.textContent = "—";
          contenu.appendChild(vide);
        }
        td.appendChild(contenu);

        td.dataset.annee = annee;
        td.dataset.sujet = s.nom;
        td.dataset.exo = String(exoNum);
        td.dataset.themes = JSON.stringify(themes);

        var estFait = getFait(annee, s.nom, exoNum);
        if (estFait) td.classList.add("sujets-traites-cell-fait");

        var btnFait = document.createElement("button");
        btnFait.type = "button";
        btnFait.className = "sujets-traites-btn-fait";
        btnFait.setAttribute("aria-label", estFait ? "Marquer comme non fait" : "Marquer comme fait");
        btnFait.textContent = estFait ? "Fait" : "Non fait";
        if (estFait) btnFait.classList.add("sujets-traites-btn-fait-active");
        btnFait.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var cell = e.currentTarget.closest("td");
          var btn = e.currentTarget;
          var an = cell.dataset.annee, su = cell.dataset.sujet, ex = parseInt(cell.dataset.exo, 10);
          var now = !getFait(an, su, ex);
          setFait(an, su, ex, now);
          cell.classList.toggle("sujets-traites-cell-fait", now);
          btn.textContent = now ? "Fait" : "Non fait";
          btn.classList.toggle("sujets-traites-btn-fait-active", now);
          btn.setAttribute("aria-label", now ? "Marquer comme non fait" : "Marquer comme fait");
        });
        td.appendChild(btnFait);

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);

    messageEl.style.display = "none";
    tableEl.style.display = "table";
  }

  function rendreThemesEdit() {
    modalThemesEdit.innerHTML = "";
    contexteModal.themes.forEach(function (texte, index) {
      const span = document.createElement("span");
      span.className = "sujets-traites-modal-theme-item";
      span.textContent = texte;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sujets-traites-modal-theme-remove";
      btn.setAttribute("aria-label", "Supprimer ce thème");
      btn.textContent = "✕";
      btn.dataset.index = String(index);
      btn.addEventListener("click", function () {
        var i = parseInt(btn.dataset.index, 10);
        contexteModal.themes.splice(i, 1);
        rendreThemesEdit();
      });
      span.appendChild(btn);
      modalThemesEdit.appendChild(span);
    });
  }

  function ouvrirModal(annee, nomSujet, numExo, themes) {
    contexteModal = { annee: annee, nomSujet: nomSujet, numExo: numExo, themes: (themes || []).slice() };
    modalTitre.textContent = nomSujet;
    modalExo.textContent = "Exercice " + numExo;
    rendreThemesEdit();
    modalNewTheme.value = "";
    modalAppreciation.value = getAppreciation(annee, nomSujet, numExo);
    modal.setAttribute("aria-hidden", "false");
    modalNewTheme.focus();
  }

  function fermerModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  function enregistrerEtFermer() {
    var a = contexteModal.annee, s = contexteModal.nomSujet, n = contexteModal.numExo;
    setThemesOverride(a, s, n, contexteModal.themes.slice());
    setAppreciation(a, s, n, modalAppreciation.value);
    fermerModal();
    if (donneesGlobales && donneesGlobales[a]) {
      construireTableau(a, donneesGlobales[a]);
      initClicsCellules();
    }
  }

  modalBtnAddTheme.addEventListener("click", function () {
    var v = (modalNewTheme.value || "").trim();
    if (v) {
      contexteModal.themes.push(v);
      rendreThemesEdit();
      modalNewTheme.value = "";
      modalNewTheme.focus();
    }
  });
  modalNewTheme.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      modalBtnAddTheme.click();
    }
  });

  function initClicsCellules() {
    tableEl.querySelectorAll(".sujets-traites-cell").forEach(function (cell) {
      cell.addEventListener("click", function () {
        var annee = cell.dataset.annee;
        var sujet = cell.dataset.sujet;
        var exo = parseInt(cell.dataset.exo, 10);
        var themes = [];
        try {
          themes = JSON.parse(cell.dataset.themes || "[]");
        } catch (e) {}
        ouvrirModal(annee, sujet, exo, themes);
      });
    });
  }

  modalClose.addEventListener("click", fermerModal);
  modalOverlay.addEventListener("click", fermerModal);
  modalBtnFermer.addEventListener("click", fermerModal);
  modalBtnEnregistrer.addEventListener("click", enregistrerEtFermer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      fermerModal();
    }
  });

  selectAnnee.addEventListener("change", function () {
    var annee = selectAnnee.value;
    if (donneesGlobales && donneesGlobales[annee]) {
      construireTableau(annee, donneesGlobales[annee]);
      initClicsCellules();
    } else {
      messageEl.textContent = "Aucune donnée pour cette année.";
      messageEl.style.display = "block";
      tableEl.style.display = "none";
    }
  });

  fetch("data/index.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      donneesGlobales = data;
      var annee = selectAnnee.value;
      if (data[annee]) {
        construireTableau(annee, data[annee]);
        initClicsCellules();
      } else {
        messageEl.textContent = "Aucune donnée pour l’année sélectionnée.";
        tableEl.style.display = "none";
      }
      // Après chargement des données, si l'utilisateur est connecté on charge sa progression
      if (window.AUTH_USER) {
        chargerProgressionServeur();
      }
    })
    .catch(function () {
      messageEl.textContent = "Impossible de charger les données.";
      tableEl.style.display = "none";
    });

  // Réagit aux connexions/déconnexions (gérées dans auth-modal.js)
  document.addEventListener("auth:login", function () {
    chargerProgressionServeur();
  });
  document.addEventListener("auth:logout", function () {
    clearLocalProgress();
    var annee = selectAnnee.value;
    if (donneesGlobales && donneesGlobales[annee]) {
      construireTableau(annee, donneesGlobales[annee]);
      initClicsCellules();
    }
  });
})();
