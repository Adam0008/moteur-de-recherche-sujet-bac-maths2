(function () {

  if (!window.supabaseClient) {
    console.error("Supabase non initialisé.");
    return;
  }

  const supabase = window.supabaseClient;

  const urlsPagesApmep = {
    "2025": "https://www.apmep.fr/IMG/pdf/Annee_spe_2025_DV_4.pdf",
    "2024": "https://www.apmep.fr/IMG/pdf/Spe_annee_2024_DV_FH4.pdf",
    "2023": "https://www.apmep.fr/IMG/pdf/annee_2023_spe_DV.pdf",
    "2022": "https://www.apmep.fr/IMG/pdf/annee_2022_spe_DV.pdf"
  };

  const PREFIX_FAIT = "sujets-traites-fait";
  const PREFIX_APP = "sujets-traites-appreciation";
  const PREFIX_THEMES = "sujets-traites-themes";

  function key(annee, sujet, exo) {
    return `${annee}|${sujet}|${exo}`;
  }

  // =============================
  // SUPABASE SAVE
  // =============================

  async function saveToSupabase(annee, sujet, exo) {
    if (!window.AUTH_USER) return;

    const data = {
      user_id: window.AUTH_USER.id,
      annee,
      sujet_nom: sujet,
      exo_num: exo,
      fait: getFait(annee, sujet, exo),
      appreciation: getAppreciation(annee, sujet, exo),
      themes: getThemes(annee, sujet, exo),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("user_progress")
      .upsert(data, { onConflict: "user_id,annee,sujet_nom,exo_num" });

    if (error) console.error("Erreur Supabase :", error.message);
  }

  async function loadFromSupabase() {
    if (!window.AUTH_USER) return;

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", window.AUTH_USER.id);

    if (error) {
      console.error(error.message);
      return;
    }

    localStorage.clear();

    data.forEach(item => {
      const k = key(item.annee, item.sujet_nom, item.exo_num);

      if (item.fait)
        localStorage.setItem(PREFIX_FAIT + "|" + k, "1");

      if (item.appreciation)
        localStorage.setItem(PREFIX_APP + "|" + k, item.appreciation);

      if (item.themes)
        localStorage.setItem(PREFIX_THEMES + "|" + k, JSON.stringify(item.themes));
    });

    location.reload();
  }

  // =============================
  // LOCAL STORAGE
  // =============================

  function getFait(a, s, e) {
    return localStorage.getItem(PREFIX_FAIT + "|" + key(a, s, e)) === "1";
  }

  function setFait(a, s, e, v) {
    const k = PREFIX_FAIT + "|" + key(a, s, e);
    v ? localStorage.setItem(k, "1") : localStorage.removeItem(k);
    saveToSupabase(a, s, e);
  }

  function getAppreciation(a, s, e) {
    return localStorage.getItem(PREFIX_APP + "|" + key(a, s, e)) || "";
  }

  function setAppreciation(a, s, e, v) {
    localStorage.setItem(PREFIX_APP + "|" + key(a, s, e), v);
    saveToSupabase(a, s, e);
  }

  function getThemes(a, s, e) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX_THEMES + "|" + key(a, s, e))) || [];
    } catch {
      return [];
    }
  }

  function setThemes(a, s, e, v) {
    localStorage.setItem(PREFIX_THEMES + "|" + key(a, s, e), JSON.stringify(v));
    saveToSupabase(a, s, e);
  }

  // =============================
  // DOM
  // =============================

  const selectAnnee = document.getElementById("select-annee-traites");
  const tableEl = document.getElementById("sujets-traites-table");

  function buildTable(annee, data) {
    tableEl.innerHTML = "";

    Object.keys(data.exercices).forEach((sujet) => {
      const tr = document.createElement("tr");
      const tdSujet = document.createElement("td");
      tdSujet.textContent = sujet;
      tr.appendChild(tdSujet);

      for (let i = 1; i <= 4; i++) {
        const td = document.createElement("td");
        const btn = document.createElement("button");

        const done = getFait(annee, sujet, i);
        btn.textContent = done ? "Fait" : "Non fait";

        btn.onclick = () => {
          setFait(annee, sujet, i, !done);
          btn.textContent = !done ? "Fait" : "Non fait";
        };

        td.appendChild(btn);
        tr.appendChild(td);
      }

      tableEl.appendChild(tr);
    });
  }

  // =============================
  // INIT
  // =============================

  fetch("data/index.json")
    .then(r => r.json())
    .then(data => {
      const annee = selectAnnee.value;
      buildTable(annee, data[annee]);

      if (window.AUTH_USER)
        loadFromSupabase();
    });

  document.addEventListener("auth:login", loadFromSupabase);

})();
