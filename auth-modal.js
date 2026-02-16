// =====================================================
// AUTH MODAL - VERSION SUPABASE
// =====================================================

(function () {

  const navConnexion = document.getElementById("nav-connexion");
  const modal = document.getElementById("auth-modal");
  const titre = document.getElementById("auth-modal-titre");

  const formConnexion = document.getElementById("auth-form-connexion");
  const formInscription = document.getElementById("auth-form-inscription");

  const goInscription = document.getElementById("auth-go-inscription");
  const goConnexion = document.getElementById("auth-go-connexion");

  const closeBtn = modal ? modal.querySelector(".auth-modal-close") : null;
  const overlay = modal ? modal.querySelector(".auth-modal-overlay") : null;

  if (!modal) return;

  let currentUser = null;
  window.AUTH_USER = null;

  // =============================
  // UI
  // =============================

  function updateNav() {
    if (!navConnexion) return;

    if (currentUser) {
      navConnexion.classList.add("nav-user");
      navConnexion.innerHTML =
        '<span class="nav-user-label">' +
        (currentUser.email || "Compte") +
        '</span>' +
        '<div class="nav-user-menu">' +
        '<button type="button" id="nav-logout-btn">Se déconnecter</button>' +
        '</div>';

      const btnLogout = document.getElementById("nav-logout-btn");
      if (btnLogout) {
        btnLogout.addEventListener("click", async function () {
          await logoutUser();
          setLoggedOut();
        });
      }

    } else {
      navConnexion.classList.remove("nav-user");
      navConnexion.textContent = "Connexion";
    }
  }

  function ouvrirConnexion() {
    titre.textContent = "Connexion";
    formConnexion.classList.remove("auth-form-hidden");
    formInscription.classList.add("auth-form-hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function ouvrirInscription() {
    titre.textContent = "Créer un compte";
    formConnexion.classList.add("auth-form-hidden");
    formInscription.classList.remove("auth-form-hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function fermer() {
    modal.setAttribute("aria-hidden", "true");
  }

  function setLoggedIn(user) {
    currentUser = user;
    window.AUTH_USER = user;
    updateNav();
  }

  function setLoggedOut() {
    currentUser = null;
    window.AUTH_USER = null;
    updateNav();
  }

  function handleError(message) {
    alert(message || "Une erreur est survenue.");
  }

  // =============================
  // SESSION AU CHARGEMENT
  // =============================

  supabase.auth.getUser().then(function (response) {
    if (response.data.user) {
      currentUser = {
        id: response.data.user.id,
        email: response.data.user.email
      };
      window.AUTH_USER = currentUser;
    }
    updateNav();
  });

  // =============================
  // NAV CLICK
  // =============================

  if (navConnexion) {
    navConnexion.addEventListener("click", function (e) {
      e.preventDefault();

      if (currentUser) {
        // déjà connecté → ne rien faire
        return;
      }

      ouvrirConnexion();
    });
  }

  if (goInscription) {
    goInscription.addEventListener("click", ouvrirInscription);
  }

  if (goConnexion) {
    goConnexion.addEventListener("click", ouvrirConnexion);
  }

  if (closeBtn) closeBtn.addEventListener("click", fermer);
  if (overlay) overlay.addEventListener("click", fermer);

  // =============================
  // CONNEXION
  // =============================

  formConnexion.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    const user = await loginUser(email, password);

    if (!user) {
      handleError("Email ou mot de passe incorrect.");
      return;
    }

    setLoggedIn({
      id: user.id,
      email: user.email
    });

    fermer();
  });

  // =============================
  // INSCRIPTION
  // =============================

  formInscription.addEventListener("submit", async function (e) {
    e.preventDefault();

    const prenom = document.getElementById("auth-prenom").value;
    const email = document.getElementById("auth-email-inscription").value;
    const p1 = document.getElementById("auth-password-inscription").value;
    const p2 = document.getElementById("auth-password-confirm").value;

    if (p1 !== p2) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const user = await registerUser(email, p1, prenom);

    if (!user) {
      handleError("Impossible de créer le compte.");
      return;
    }

    setLoggedIn({
      id: user.id,
      email: user.email,
      prenom: prenom
    });

    fermer();
  });

  // =============================
  // ESC POUR FERMER
  // =============================

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      fermer();
    }
  });

})();
