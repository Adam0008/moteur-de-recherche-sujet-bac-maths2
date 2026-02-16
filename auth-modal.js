// Gestion du modal + appels API d'authentification
(function () {
  const navConnexion = document.getElementById("nav-connexion");
  const modal = document.getElementById("auth-modal");
  const titre = document.getElementById("auth-modal-titre");
  const formConnexion = document.getElementById("auth-form-connexion");
  const formInscription = document.getElementById("auth-form-inscription");
  const formReset1 = document.getElementById("auth-form-reset-step1");
  const formReset2 = document.getElementById("auth-form-reset-step2");
  const formReset3 = document.getElementById("auth-form-reset-step3");
  const goInscription = document.getElementById("auth-go-inscription");
  const goConnexion = document.getElementById("auth-go-connexion");
  const forgotPasswordBtn = document.getElementById("auth-forgot-password");
  const resetBack1 = document.getElementById("auth-reset-back-to-login-1");
  const resetBack2 = document.getElementById("auth-reset-back-to-login-2");
  const resetBack3 = document.getElementById("auth-reset-back-to-login-3");
  const closeBtn = modal ? modal.querySelector(".auth-modal-close") : null;
  const overlay = modal ? modal.querySelector(".auth-modal-overlay") : null;

  if (!modal) return;

  var currentUser = null;
  window.AUTH_USER = null;
  var resetEmail = "";

  function updateNav() {
    if (!navConnexion) return;

    if (currentUser) {
      navConnexion.classList.add("nav-user");
      var label = currentUser.prenom || currentUser.email || "Compte";
      navConnexion.innerHTML =
        '<span class="nav-user-label">' + label + '</span>' +
        '<span class="nav-user-arrow">▼</span>' +
        '<div class="nav-user-menu">' +
        '  <button type="button" id="nav-logout-btn" class="nav-user-logout">Se déconnecter</button>' +
        "</div>";

      var btnLogout = document.getElementById("nav-logout-btn");
      if (btnLogout) {
        btnLogout.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          faireDeconnexion();
        });
      }
    } else {
      navConnexion.classList.remove("nav-user");
      navConnexion.classList.remove("nav-user-open");
      navConnexion.textContent = "Connexion";
    }
  }

  function ouvrirConnexion() {
    titre.textContent = "Connexion";
    formConnexion.classList.remove("auth-form-hidden");
    formInscription.classList.add("auth-form-hidden");
    if (formReset1) formReset1.classList.add("auth-form-hidden");
    if (formReset2) formReset2.classList.add("auth-form-hidden");
    if (formReset3) formReset3.classList.add("auth-form-hidden");
    modal.setAttribute("aria-hidden", "false");
    var emailInput = document.getElementById("auth-email");
    if (emailInput) emailInput.focus();
  }

  function ouvrirInscription() {
    titre.textContent = "Créer un compte";
    formConnexion.classList.add("auth-form-hidden");
    formInscription.classList.remove("auth-form-hidden");
    if (formReset1) formReset1.classList.add("auth-form-hidden");
    if (formReset2) formReset2.classList.add("auth-form-hidden");
    if (formReset3) formReset3.classList.add("auth-form-hidden");
    modal.setAttribute("aria-hidden", "false");
    var nomInput = document.getElementById("auth-nom");
    if (nomInput) nomInput.focus();
  }

  function fermer() {
    modal.setAttribute("aria-hidden", "true");
  }

  function setLoggedIn(user) {
    currentUser = user;
    window.AUTH_USER = user;
    updateNav();
    document.dispatchEvent(new CustomEvent("auth:login", { detail: user }));
  }

  function setLoggedOut() {
    currentUser = null;
    window.AUTH_USER = null;
    updateNav();
    document.dispatchEvent(new CustomEvent("auth:logout"));
  }

  function handleError(message) {
    alert(message || "Une erreur est survenue. Merci de réessayer.");
  }

  function apiPost(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload || {})
    }).then(function (res) {
      if (!res.ok) return res.json().catch(function () { return { ok: false }; });
      return res.json();
    });
  }

  function faireDeconnexion() {
    apiPost("auth_logout.php", {})
      .then(function (data) {
        if (data && data.ok) {
          setLoggedOut();
        } else {
          handleError("Impossible de se déconnecter.");
        }
      })
      .catch(function () {
        handleError("Impossible de se déconnecter.");
      });
  }

  // Chargement initial de la session (si déjà connecté)
  fetch("auth_session.php", { credentials: "same-origin" })
    .then(function (res) { return res.ok ? res.json() : { ok: false }; })
    .then(function (data) {
      if (data && data.ok && data.logged_in && data.user) {
        currentUser = data.user;
        window.AUTH_USER = data.user;
      }
      updateNav();
    })
    .catch(function () {
      updateNav();
    });

  if (navConnexion) {
    navConnexion.addEventListener("click", function (e) {
      e.preventDefault();
      if (currentUser) {
        // Ouvre / ferme le petit menu (cellule qui s'agrandit)
        navConnexion.classList.toggle("nav-user-open");
      } else {
        ouvrirConnexion();
      }
    });
  }

  if (goInscription) {
    goInscription.addEventListener("click", ouvrirInscription);
  }

  if (goConnexion) {
    goConnexion.addEventListener("click", ouvrirConnexion);
  }

  if (forgotPasswordBtn && formReset1 && formReset2 && formReset3) {
    forgotPasswordBtn.addEventListener("click", function () {
      titre.textContent = "Mot de passe oublié";
      formConnexion.classList.add("auth-form-hidden");
      formInscription.classList.add("auth-form-hidden");
      formReset2.classList.add("auth-form-hidden");
      formReset3.classList.add("auth-form-hidden");
      formReset1.classList.remove("auth-form-hidden");
      modal.setAttribute("aria-hidden", "false");
      var emailInput = document.getElementById("auth-reset-email");
      if (emailInput) {
        emailInput.value = document.getElementById("auth-email")?.value || "";
        emailInput.focus();
      }
    });
  }

  function retourConnexionDepuisReset() {
    resetEmail = "";
    if (formReset1) formReset1.classList.add("auth-form-hidden");
    if (formReset2) formReset2.classList.add("auth-form-hidden");
    if (formReset3) formReset3.classList.add("auth-form-hidden");
    ouvrirConnexion();
  }

  if (resetBack1) resetBack1.addEventListener("click", retourConnexionDepuisReset);
  if (resetBack2) resetBack2.addEventListener("click", retourConnexionDepuisReset);
  if (resetBack3) resetBack3.addEventListener("click", retourConnexionDepuisReset);

  if (closeBtn) closeBtn.addEventListener("click", fermer);
  if (overlay) overlay.addEventListener("click", fermer);

  formConnexion.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("auth-email").value;
    var password = document.getElementById("auth-password").value;

    apiPost("auth_login.php", { email: email, password: password })
      .then(function (data) {
        if (!data || !data.ok) {
          handleError("Email ou mot de passe incorrect.");
          return;
        }
        setLoggedIn(data.user);
        fermer();
      })
      .catch(function () {
        handleError("Impossible de se connecter.");
      });
  });

  formInscription.addEventListener("submit", function (e) {
    e.preventDefault();
    var nom = document.getElementById("auth-nom").value;
    var prenom = document.getElementById("auth-prenom").value;
    var email = document.getElementById("auth-email-inscription").value;
    var p1 = document.getElementById("auth-password-inscription").value;
    var p2 = document.getElementById("auth-password-confirm").value;

    if (p1 !== p2) {
      var confirmEl = document.getElementById("auth-password-confirm");
      confirmEl.setCustomValidity("Les mots de passe ne correspondent pas.");
      confirmEl.reportValidity();
      return;
    }
    document.getElementById("auth-password-confirm").setCustomValidity("");

    apiPost("auth_register.php", {
      nom: nom,
      prenom: prenom,
      email: email,
      password: p1
    })
      .then(function (data) {
        if (!data || !data.ok) {
          if (data && data.error === "email_exists") {
            handleError("Un compte existe déjà avec cet email.");
          } else if (data && data.error === "password_too_short") {
            handleError("Le mot de passe doit contenir au moins 6 caractères.");
          } else {
            handleError("Impossible de créer le compte.");
          }
          return;
        }
        setLoggedIn(data.user);
        fermer();
        alert("Vous êtes inscrit !");
      })
      .catch(function () {
        handleError("Impossible de créer le compte.");
      });
  });

  // Mot de passe oublié : étape 1 (envoi code)
  if (formReset1) {
    formReset1.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("auth-reset-email").value;
      resetEmail = email;
      apiPost("password_reset_request.php", { email: email })
        .then(function (data) {
          if (!data || !data.ok) {
            handleError("Impossible d'envoyer le code. Réessayez plus tard.");
            return;
          }
          alert("Si un compte existe pour cet email, un code de validation a été envoyé.");
          formReset1.classList.add("auth-form-hidden");
          formReset2.classList.remove("auth-form-hidden");
          var codeInput = document.getElementById("auth-reset-code");
          if (codeInput) codeInput.focus();
        })
        .catch(function () {
          handleError("Impossible d'envoyer le code. Réessayez plus tard.");
        });
    });
  }

  // Mot de passe oublié : étape 2 (vérification code)
  if (formReset2) {
    formReset2.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = document.getElementById("auth-reset-code").value;
      apiPost("password_reset_verify.php", { email: resetEmail, code: code })
        .then(function (data) {
          if (!data || !data.ok) {
            if (data && data.error === "code_expired") {
              handleError("Le code a expiré. Merci de refaire une demande.");
            } else {
              handleError("Code invalide.");
            }
            return;
          }
          formReset2.classList.add("auth-form-hidden");
          formReset3.classList.remove("auth-form-hidden");
          var p = document.getElementById("auth-reset-password");
          if (p) p.focus();
        })
        .catch(function () {
          handleError("Impossible de vérifier le code. Réessayez plus tard.");
        });
    });
  }

  // Mot de passe oublié : étape 3 (nouveau mot de passe)
  if (formReset3) {
    formReset3.addEventListener("submit", function (e) {
      e.preventDefault();
      var p1 = document.getElementById("auth-reset-password").value;
      var p2 = document.getElementById("auth-reset-password-confirm").value;
      if (p1 !== p2) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }
      apiPost("password_reset_change.php", { password: p1 })
        .then(function (data) {
          if (!data || !data.ok) {
            if (data && data.error === "password_too_short") {
              handleError("Le mot de passe doit contenir au moins 6 caractères.");
            } else {
              handleError("Impossible de changer le mot de passe.");
            }
            return;
          }
          if (data.user) {
            setLoggedIn(data.user);
          }
          alert("Votre mot de passe a été changé.");
          fermer();
          formReset3.classList.add("auth-form-hidden");
          formConnexion.classList.remove("auth-form-hidden");
        })
        .catch(function () {
          handleError("Impossible de changer le mot de passe.");
        });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      fermer();
    }
  });

  var showConnexion = document.getElementById("auth-show-password-connexion");
  var passConnexion = document.getElementById("auth-password");
  if (showConnexion && passConnexion) {
    showConnexion.addEventListener("change", function () {
      passConnexion.type = showConnexion.checked ? "text" : "password";
    });
  }

  var showInscription = document.getElementById("auth-show-password-inscription");
  var passInscription = document.getElementById("auth-password-inscription");
  var passConfirm = document.getElementById("auth-password-confirm");
  if (showInscription && passInscription && passConfirm) {
    showInscription.addEventListener("change", function () {
      var visible = showInscription.checked;
      passInscription.type = visible ? "text" : "password";
      passConfirm.type = visible ? "text" : "password";
    });
  }
})();
