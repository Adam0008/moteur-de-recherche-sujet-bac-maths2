/**
 * script.js – Interface de recherche (navigateur) + scripts de build (Node).
 * En navigateur : recherche par thèmes, affichage des résultats.
 * En Node : node script.js → met à jour data/index.json (2022, 2023, 2024).
 */

(function () {
  const isNode = typeof process !== "undefined" && process.versions && process.versions.node;

  if (isNode) {
    // ========== BUILD (Node uniquement) ==========
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "data", "index.json");

    // --- Index 2022 : thème → pages ---
    const index2022 = `
arbre pondéré, 5, 8, 13, 21, 30, 32, 40, 43, 48, 51, 56, 61, 67, 71, 76, 80, 88
asymptote, 14, 39, 45, 66, 92
calcul d'angle, 58, 86
convergence de suite, 29, 33, 41
convexité, 4, 14, 16, 22, 28, 29, 36, 39, 53, 64, 66, 73, 78, 82, 84, 89
droites perpendiculaires, 52
dérivée, 7, 11, 24, 27, 29, 35, 36, 39, 45, 46, 54, 57, 60, 63, 69, 73, 74, 77, 81, 82, 84, 85, 89
dérivée seconde, 28, 36, 39
ensemble de définition, 16
équation, 36, 39, 60, 73
équation avec exponentielle, 15
équation de droite, 6, 17
équation de tangente, 64
équation de plan, 6, 10, 12, 17, 24, 34, 38, 46, 50, 52, 59, 65, 70, 75, 79, 83, 86, 90
équation paramétrique de droite, 12, 35, 38, 47, 50, 52, 59, 65, 70, 75, 78, 83, 86, 90
équation de tangente, 7, 17, 18, 29, 45, 57, 60
espérance, 31, 40, 41, 44, 48, 51, 68, 71, 88
évènements indépendants, 19, 32, 51
fonction exponentielle, 11, 17, 28, 34, 45, 53, 54, 57, 66, 69, 84, 91, 92
fonction logarithme, 3, 7, 16, 17, 29, 35, 39, 44, 45, 54, 59, 60, 63, 64, 67, 69, 73, 74, 77, 81, 84, 89, 91
fonction monotone, 54
fonction paire, 36
fonction polynôme, 57, 62
inéquation, 8, 11, 17, 30, 33, 34, 44, 46, 49, 51, 57, 62, 88
lecture graphique, 35, 36, 39, 45, 53, 58, 62, 64, 73, 78, 90
limite de fonction, 7, 15, 18, 24, 28, 29, 36, 39, 45, 50, 69, 73, 77, 81, 82, 84, 89
limite de suite, 3, 6, 9, 12, 18, 41, 46, 49, 57, 62, 63, 74, 77, 82, 85
loi binomiale, 5, 8, 13, 19, 22, 32, 40, 44, 48, 51, 61, 72, 76, 88
loi de probabilité, 30, 41, 48, 68
maximum, 4, 11, 22, 24, 26, 28, 39
mesure d'angle, 50, 83
plan médiateur, 47
point d'inflexion, 16, 45, 50, 53, 57, 66, 82, 84
pourcentage moyen, 14
primitive, 3, 7, 14, 16, 28, 64, 67, 73, 92
probabilités, 13, 19, 21, 30, 32, 48, 60, 61, 67, 71, 80, 87, 88
produit scalaire, 6, 12, 17, 58, 78, 83
QCM, 7, 14, 16, 22, 27, 44, 52, 59, 66, 72, 86, 90
récurrence, 6, 9, 12, 29, 33, 41, 46, 49, 55, 57, 62, 69, 74, 77, 82, 85
script python, 4, 5, 9, 13, 33, 42, 46, 49, 54, 63, 72, 77, 83, 85, 89
sommaire, 1
sphère, 47
suite arithmétique, 72
suite bornée, 53
suite convergente, 49, 55, 63, 67, 69, 74, 77, 82, 91
suite géométrique, 12, 33, 49, 67, 72, 77, 82
suite monotone, 91
suites, 12, 18, 23, 29, 33, 41, 45, 46, 53, 54, 62, 66, 72, 74, 77, 82, 85, 90
tableau de probabilités, 19
tableau de variations, 11, 18, 24, 29, 36, 39, 46, 54, 63, 69, 73, 81, 82, 84, 85, 89
tangente d'angle, 25
tangente à la courbe, 50, 89
triangle rectangle, 30, 49, 70, 78
valeurs intermédiaires, 11, 16, 24, 36, 46, 50, 54, 57, 69, 78, 81, 84, 89
vecteur directeur, 12, 74
vecteur normal, 23, 30, 34, 38, 50, 52, 59, 65, 70, 75, 83, 90
vecteurs colinéaires, 12, 78
vecteurs orthogonaux, 59
volume pyramide, 38, 65, 90
volume tétraèdre, 13, 17, 23, 30, 35, 50, 52, 70, 75, 79
Vrai-Faux, 50
`;

    const themeAliases = {
      "récurrence": "démonstration par récurrence",
      "script python": "Python",
      "QCM": "Q. C. M.",
      "fonction logarithme": "fonction logarithme népérien",
      "suites": "suite",
    };

    function normalizeTheme(name) {
      const t = name.trim();
      return themeAliases[t] || t;
    }

    const themeToPages = {};
    for (const line of index2022.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(",").map((p) => p.trim());
      if (parts.length < 2) continue;
      const theme = normalizeTheme(parts[0]);
      if (!themeToPages[theme]) themeToPages[theme] = [];
      for (let i = 1; i < parts.length; i++) {
        const n = parseInt(parts[i], 10);
        if (!isNaN(n) && !themeToPages[theme].includes(n)) themeToPages[theme].push(n);
      }
    }

    const pageToThemes = {};
    for (const [theme, pages] of Object.entries(themeToPages)) {
      for (const p of pages) {
        if (!pageToThemes[p]) pageToThemes[p] = [];
        pageToThemes[p].push(theme);
      }
    }

    const sommaire2022 = [
      [1, "Sommaire"],
      [3, "Polynésie 4 mai 2022"],
      [7, "Polynésie 5 mai 2022"],
      [11, "Métropole 11 mai 2022"],
      [16, "Centres étrangers 11 mai 2022"],
      [21, "Métropole 12 mai 2022"],
      [27, "Centres étrangers 12 mai 2022"],
      [32, "Asie 17 mai 2022"],
      [38, "Asie 18 mai 2022"],
      [43, "Groupe I 18 mai 2022"],
      [48, "Amérique du Nord 18 mai 2022"],
      [51, "Groupe I 19 mai 2022"],
      [56, "Amérique du Nord 19 mai 2022"],
      [61, "Polynésie 30 août 2022"],
      [66, "Métropole 9 septembre 2022"],
      [71, "Métropole 10 septembre 2022"],
      [76, "Amérique du Sud 26 septembre 2022"],
      [80, "Amérique du Sud 27 septembre 2022"],
      [84, "Nouvelle-Calédonie 26 octobre 2022"],
      [88, "Nouvelle-Calédonie 27 octobre 2022"],
    ];

    function sujetForPage2022(page) {
      let sujet = "Inconnu";
      for (let i = sommaire2022.length - 1; i >= 0; i--) {
        if (page >= sommaire2022[i][0]) {
          sujet = sommaire2022[i][1];
          break;
        }
      }
      return sujet;
    }

    const sommaire2024 = [
      [1, "Sommaire"],
      [3, "Amérique du Nord J1 – 21 mai 2024"],
      [7, "Amérique du Nord J2 – 22 mai 2024"],
      [11, "Centres étrangers J1 – 5 juin 2024"],
      [15, "Centres étrangers J2 – 6 juin 2024"],
      [18, "Centres étrangers - Suède – 7 juin 2024"],
      [22, "Asie J1 – 10 juin 2024"],
      [28, "Asie J2 – 11 juin 2024"],
      [33, "Métropole J1 – 19 juin 2024"],
      [37, "Métropole J1 secours – 19 juin 2024"],
      [41, "Métropole J2 – 20 juin 2024"],
      [46, "Métropole J2 dévoilé – 20 juin 2024"],
      [51, "Polynésie J1 – 19 juin 2024"],
      [55, "Polynésie J2 – 20 juin 2024"],
      [60, "Polynésie – 5 septembre 2024"],
      [64, "Métropole – 11 septembre 2024"],
      [69, "Métropole – 12 septembre 2024"],
      [74, "Amérique du Sud J1 – 21 novembre 2024"],
      [78, "Amérique du Sud J2 – 22 novembre 2024"],
    ];

    const sommaire2023 = [
      [1, "Sommaire"],
      [3, "Centres étrangers J1 13 mars 2023"],
      [8, "Polynésie J1 13 mars 2023"],
      [12, "Centres étrangers J2 14 mars 2023"],
      [17, "Polynésie J2 14 mars 2023"],
      [21, "Métropole J1 20 mars 2023"],
      [25, "Métropole J2 21 mars 2023"],
      [30, "Centres étrangers 2 J1 21 mars 2023"],
      [33, "Centres étrangers 2 J2 22 mars 2023"],
      [37, "Asie J1 23 mars 2023"],
      [43, "Asie J2 24 mars 2023"],
      [48, "Amérique du Nord J1 27 mars 2023"],
      [52, "La Réunion J1 28 mars 2023"],
      [56, "Amérique du Nord J2 28 mars 2023"],
      [60, "La Réunion J2 29 mars 2023"],
      [64, "Nouvelle-Calédonie J1 28 août 2023"],
      [68, "Nouvelle-Calédonie J2 29 août 2023"],
      [72, "Polynésie 7 septembre 2023"],
      [77, "Métropole J1 11 septembre 2023"],
      [81, "Métropole J2 12 septembre 2023"],
      [85, "Amérique du Sud J1 26 septembre 2023"],
      [90, "Amérique du Sud J2 27 septembre 2023"],
    ];

    function sujetForPage(sommaireEntries, page) {
      let sujet = "Inconnu";
      for (let i = sommaireEntries.length - 1; i >= 0; i--) {
        if (page >= sommaireEntries[i][0]) {
          sujet = sommaireEntries[i][1];
          break;
        }
      }
      return sujet;
    }

    function transformYear(data, annee, sommaireEntries) {
      const raw = data[annee];
      if (!Array.isArray(raw)) return;
      const sommaire = sommaireEntries.map(([p, n]) => ({ nom: n, page: p }));
      const exercices = raw.map((e) => ({
        ...e,
        sujet: sujetForPage(sommaireEntries, e.page),
      }));
      data[annee] = { sommaire, exercices };
    }

    // Exécution du build
    let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const pages2022 = Object.keys(pageToThemes)
      .map(Number)
      .sort((a, b) => a - b);
    const exercices2022 = pages2022.map((page) => ({
      page,
      themes: pageToThemes[page].sort(),
      sujet: sujetForPage2022(page),
    }));
    data["2022"] = {
      sommaire: sommaire2022.map(([p, n]) => ({ nom: n, page: p })),
      exercices: exercices2022,
    };

    transformYear(data, "2024", sommaire2024);
    transformYear(data, "2023", sommaire2023);

    const ordered = {};
    ["2022", "2023", "2024", "2025"].forEach((y) => {
      if (data[y]) ordered[y] = data[y];
    });
    Object.keys(data)
      .filter((y) => !ordered[y])
      .forEach((y) => (ordered[y] = data[y]));

    fs.writeFileSync(filePath, JSON.stringify(ordered, null, 2), "utf8");
    console.log("OK: data/index.json mis à jour (2022, 2023, 2024).");
    return;
  }

  // ========== INTERFACE (navigateur uniquement) ==========
  let data = {};

  const chapitres = {
    "📘 ANALYSE – Fonctions": [
      "calcul de dérivée", "nombre dérivé", "dérivée", "dérivée seconde",
      "fonction croissante", "variations de fonction", "extremum", "maximum", "minimum",
      "point d'inflexion", "convexité", "fonction exponentielle", "fonction logarithme népérien",
      "signe d'une fonction", "position relative courbe–tangente", "équation de tangente",
      "lecture graphique", "valeur moyenne d'une fonction", "asymptote"
    ],
    "📗 LIMITES – CONTINUITÉ": [
      "calcul de limite", "limite de fonction", "limite de suite",
      "théorème des valeurs intermédiaires", "fonction bornée"
    ],
    "📙 INTÉGRATION": [
      "intégrale", "calcul d'intégrale", "primitive", "intégration par parties"
    ],
    "📕 ÉQUATIONS – INÉQUATIONS": [
      "équation du second degré", "équation différentielle", "équation différentielle homogène", "inéquation"
    ],
    "📐 GÉOMÉTRIE PLANE": [
      "aire de triangle", "calcul d'aire", "triangle rectangle", "calcul d'angle",
      "mesure d'angle", "coefficient directeur de droite", "équation de droite",
      "intersection de droites", "droites parallèles", "droites perpendiculaires",
      "droites sécantes", "points alignés", "points non alignés"
    ],
    "📦 GÉOMÉTRIE DANS L'ESPACE": [
      "géométrie dans l'espace", "équation de plan", "représentation paramétrique de droite",
      "droites non coplanaires", "droite et plan parallèles", "droite et plan orthogonaux",
      "plans parallèles", "plans perpendiculaires", "plans orthogonaux", "plans sécants",
      "distance d'un point à une droite", "distance point-plan", "projeté orthogonal",
      "vecteur normal", "vecteur et plan orthogonaux", "vecteurs colinéaires",
      "produit scalaire", "points coplanaires", "sphère", "volume de pyramide", "volume de tétraèdre"
    ],
    "🎲 PROBABILITÉS – STATISTIQUES": [
      "probabilités", "probabilité conditionnelle", "évènements indépendants",
      "loi binomiale", "espérance", "variance", "moyenne", "somme de variables aléatoires",
      "variable aléatoire", "inégalité de Bienaymé-Tchebychev", "inégalité de concentration",
      "arbre pondéré", "Bienaymé-Tchebychev"
    ],
    "🔢 SUITES": [
      "suite", "suite convergente", "suite divergente", "suite croissante",
      "suite décroissante", "suite géométrique"
    ],
    "🧮 DÉNOMBREMENT – COMBINATOIRE": [
      "combinatoire", "arrangements et combinaisons", "n-uplets"
    ],
    "🧠 RAISONNEMENTS – MÉTHODES": [
      "démonstration par récurrence", "raisonnement par l'absurde"
    ],
    "💻 ALGORITHMIQUE": [
      "Python"
    ]
  };

  const themesIncompatibles = [
    ["géométrie dans l'espace", "analyse"],
    ["probabilités", "géométrie dans l'espace"]
  ];

  const themesAExclureParDefaut = ["Q. C. M.", "Vrai–Faux"];
  // Variantes possibles dans les données (ex. 2022 utilise "Vrai-Faux", pas "Vrai–Faux")
  const exclusVariantes = {
    "Vrai–Faux": ["Vrai–Faux", "Vrai-Faux"],
    "Q. C. M.": ["Q. C. M.", "QCM"],
  };

  const selectAnnee = document.getElementById("annee");
  const obligatoiresDiv = document.getElementById("chapitres-obligatoires");
  const exclusDiv = document.getElementById("chapitres-exclus");
  const resultatsUl = document.getElementById("resultats");
  const resultatsPaginationDiv = document.getElementById("resultats-pagination");
  const messageErreurJson = document.getElementById("message-erreur-json");
  const lienApmep = document.getElementById("lien-apmep");

  const RESULTATS_PAR_PAGE = 20;
  let resultatsComplets = [];
  let anneeRecherche = "";
  let procheRecherche = false;
  let resultatsAffichésCount = RESULTATS_PAR_PAGE;

  const urlsApmep = {
    "2025": "https://www.apmep.fr/IMG/pdf/Annee_spe_2025_DV_4.pdf",
    "2024": "https://www.apmep.fr/IMG/pdf/Spe_annee_2024_DV_FH4.pdf",
    "2023": "https://www.apmep.fr/IMG/pdf/annee_2023_spe_DV.pdf",
    "2022": "https://www.apmep.fr/IMG/pdf/annee_2022_spe_DV.pdf"
  };

  const urlsPagesApmep = {
    "2025": "https://www.apmep.fr/IMG/pdf/Annee_spe_2025_DV_4.pdf",
    "2024": "https://www.apmep.fr/IMG/pdf/Spe_annee_2024_DV_FH4.pdf",
    "2023": "https://www.apmep.fr/IMG/pdf/annee_2023_spe_DV.pdf",
    "2022": "https://www.apmep.fr/IMG/pdf/annee_2022_spe_DV.pdf"
  };

  const PREFIX_FAIT = "sujets-traites-fait";

  function getFait(annee, nomSujet, numExo) {
    try {
      const cle = PREFIX_FAIT + "|" + annee + "|" + nomSujet + "|" + numExo;
      return localStorage.getItem(cle) === "1";
    } catch (e) {
      return false;
    }
  }

  function getNumeroExercice(annee, sujetNom, page) {
    const raw = data && data[annee] && data[annee].exercices;
    if (!raw || !Array.isArray(raw)) return 0;
    const exos = raw.filter((ex) => ex.sujet === sujetNom).sort((a, b) => a.page - b.page);
    const idx = exos.findIndex((ex) => ex.page === page);
    return idx >= 0 ? idx + 1 : 0;
  }

  function chargerDonnees() {
    messageErreurJson.style.display = "none";
    messageErreurJson.innerHTML = "";
    fetch("data/index.json")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau " + res.status);
        return res.json();
      })
      .then((json) => {
        data = json;
        chargerAnnees();
      })
      .catch((err) => {
        messageErreurJson.style.display = "block";
        messageErreurJson.innerHTML =
          "<p><strong>Impossible de charger les sujets.</strong> Réessayez plus tard.</p>" +
          "<button type=\"button\" class=\"btn-reessayer\">Réessayer</button>";
        messageErreurJson.querySelector(".btn-reessayer").addEventListener("click", chargerDonnees);
      });
  }

  chargerDonnees();

  function chargerAnnees() {
    for (let annee in data) {
      const option = document.createElement("option");
      option.value = annee;
      option.textContent = annee;
      selectAnnee.appendChild(option);
    }
    chargerThemes();
    mettreAJourLienApmep();
  }

  selectAnnee.addEventListener("change", () => {
    chargerThemes();
    mettreAJourLienApmep();
  });

  function chargerThemes() {
    obligatoiresDiv.innerHTML = "";
    exclusDiv.innerHTML = "";

    const annee = selectAnnee.value;
    const tousLesThemes = new Set();

    const donnees = getDonneesAnnee(annee);

    donnees.forEach(item => {
      item.themes.forEach(t => tousLesThemes.add(t));
    });

    for (let chapitre in chapitres) {
      obligatoiresDiv.appendChild(creerChapitre(chapitre, chapitres[chapitre], "obligatoire", tousLesThemes));
    }

    const themesDisponiblesExclus = themesAExclureParDefaut.filter((t) => {
      if (tousLesThemes.has(t)) return true;
      const variantes = exclusVariantes[t];
      return variantes && variantes.some((v) => tousLesThemes.has(v));
    });
    themesDisponiblesExclus.forEach((theme) => {
      exclusDiv.appendChild(creerCheckbox(theme, "exclu"));
    });
  }

  function getDonneesAnnee(annee) {
    const raw = data[annee];
    if (Array.isArray(raw)) return raw;
    if (raw && raw.exercices) return raw.exercices;
    return extrairePagesDonnees(raw);
  }

  function extrairePagesDonnees(sujets) {
    const pages = [];
    for (let sujet in sujets) {
      sujets[sujet].forEach(exercice => {
        exercice.pages.forEach(page => {
          if (!pages.find(p => p.page === page)) {
            pages.push({ page, themes: exercice.themes });
          }
        });
      });
    }
    return pages;
  }

  function mettreAJourLienApmep() {
    const annee = selectAnnee.value;
    const url = urlsApmep[annee];
    if (url) {
      lienApmep.href = url;
      lienApmep.style.display = "inline";
    } else {
      lienApmep.style.display = "none";
    }
  }

  function creerChapitre(titre, themes, type, themesDisponibles) {
    const div = document.createElement("div");
    div.className = "chapitre";

    const titreLi = document.createElement("div");
    titreLi.className = "chapitre-titre";
    titreLi.innerHTML = `
      <span>${titre}</span>
      <span class="chapitre-toggle">▼</span>
    `;
    titreLi.addEventListener("click", () => {
      themesDiv.classList.toggle("collapsed");
      titreLi.querySelector(".chapitre-toggle").textContent = themesDiv.classList.contains("collapsed") ? "▶" : "▼";
    });

    const themesDiv = document.createElement("div");
    themesDiv.className = "chapitre-themes";

    themes.forEach(theme => {
      if (themesDisponibles.has(theme)) {
        themesDiv.appendChild(creerCheckbox(theme, type));
      }
    });

    div.appendChild(titreLi);
    div.appendChild(themesDiv);
    return div;
  }

  function creerCheckbox(theme, type) {
    const label = document.createElement("label");
    const input = document.createElement("input");

    input.type = "checkbox";
    input.value = theme;
    input.dataset.type = type;

    label.appendChild(input);
    label.append(" " + theme);
    return label;
  }

  document.getElementById("btn-recherche").addEventListener("click", rechercher);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const tag = document.activeElement?.tagName;
    if (["SELECT", "INPUT", "TEXTAREA"].includes(tag)) return;
    e.preventDefault();
    rechercher();
  });

  function rechercher() {
    const annee = selectAnnee.value;
    const obligatoires = [...document.querySelectorAll("input[data-type='obligatoire']:checked")].map(i => i.value);
    const exclus = [...document.querySelectorAll("input[data-type='exclu']:checked")].map((i) => i.value);

    const donnees = getDonneesAnnee(annee);

    function sujetContientThemeExclu(sujet, themeExclu) {
      const variantes = exclusVariantes[themeExclu] || [themeExclu];
      return variantes.some((v) => sujet.themes.includes(v));
    }

    let resultats = donnees.filter(
      (sujet) =>
        obligatoires.every((t) => sujet.themes.includes(t)) &&
        exclus.every((t) => !sujetContientThemeExclu(sujet, t))
    );

    if (resultats.length === 0 && obligatoires.length > 0) {
      let themesFiltres = [...obligatoires];
      themesIncompatibles.forEach(groupe => {
        if (groupe.every(t => themesFiltres.includes(t))) {
          themesFiltres = themesFiltres.filter(t => !groupe.includes(t)[0]);
        }
      });

      resultats = donnees.map(sujet => {
        const themesIgnorés = themesFiltres.filter(t => !sujet.themes.includes(t));
        const score = themesFiltres.length - themesIgnorés.length;
        return { ...sujet, score, themesIgnorés };
      }).filter(s => s.score > 0);

      resultats.sort((a, b) => b.score - a.score || a.page - b.page);
      afficher(resultats, annee, true);
    } else {
      afficher(resultats, annee, false);
    }
  }

  function creerLigneResultat(s, annee, proche, urlPdf) {
    const li = document.createElement("li");
    const exoNum = s.sujet ? getNumeroExercice(annee, s.sujet, s.page) : 0;
    const estFait = exoNum > 0 && getFait(annee, s.sujet, exoNum);
    if (estFait) li.classList.add("resultat-exercice-fait");
    const strong = document.createElement("strong");
    if (s.sujet) {
      strong.textContent = `📖 Année ${annee} – Page ${s.page} – ${s.sujet}`;
    } else {
      strong.textContent = `📖 Année ${annee} – Page ${s.page}`;
    }
    li.appendChild(strong);
    if (urlPdf) {
      const a = document.createElement("a");
      a.href = `${urlPdf}#page=${s.page}`;
      a.target = "_blank";
      a.style.marginLeft = "10px";
      a.style.fontSize = "12px";
      a.textContent = "📄 Voir en PDF";
      li.appendChild(a);
    }
    li.appendChild(document.createElement("br"));
    const spanThemes = document.createElement("span");
    spanThemes.textContent = `Thèmes : ${s.themes.join(", ")}`;
    li.appendChild(spanThemes);
    if (proche && s.themesIgnorés && s.themesIgnorés.length > 0) {
      li.appendChild(document.createElement("br"));
      const em = document.createElement("em");
      em.textContent = `Thèmes ignorés pour ce résultat : ${s.themesIgnorés.join(", ")}`;
      li.appendChild(em);
    }
    return li;
  }

  function afficherPage() {
    resultatsUl.innerHTML = "";
    resultatsPaginationDiv.innerHTML = "";
    const urlPdf = urlsPagesApmep[anneeRecherche];
    const aAfficher = resultatsComplets.slice(0, resultatsAffichésCount);

    if (procheRecherche && resultatsComplets.length > 0) {
      const info = document.createElement("li");
      info.textContent = "⚠️ Aucun sujet ne correspondait exactement à tous vos thèmes. Voici les sujets les plus proches (thèmes incompatibles ignorés).";
      info.style.fontStyle = "italic";
      resultatsUl.appendChild(info);
    }

    aAfficher.forEach((s) => {
      resultatsUl.appendChild(creerLigneResultat(s, anneeRecherche, procheRecherche, urlPdf));
    });

    const restants = resultatsComplets.length - resultatsAffichésCount;
    if (restants > 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-afficher-plus";
      btn.textContent = `Afficher plus (${restants} restant${restants > 1 ? "s" : ""})`;
      btn.addEventListener("click", () => {
        resultatsAffichésCount += RESULTATS_PAR_PAGE;
        afficherPage();
      });
      resultatsPaginationDiv.appendChild(btn);
    }
  }

  function afficher(resultats, annee, proche) {
    resultatsComplets = resultats;
    anneeRecherche = annee;
    procheRecherche = proche;
    resultatsAffichésCount = RESULTATS_PAR_PAGE;

    if (resultats.length === 0) {
      resultatsUl.innerHTML = "";
      resultatsPaginationDiv.innerHTML = "";
      const li = document.createElement("li");
      li.textContent = "❌ Aucun sujet correspondant à votre recherche.";
      resultatsUl.appendChild(li);
      return;
    }

    afficherPage();
  }
})();
