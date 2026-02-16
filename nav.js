/**
 * Menu mobile : ouverture/fermeture au clic sur le bouton hamburger.
 */
(function () {
  const toggle = document.querySelector(".navbar-toggle");
  const navbar = document.querySelector(".navbar");
  if (!toggle || !navbar) return;

  toggle.addEventListener("click", function () {
    const open = navbar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });

  // Fermer le menu en cliquant sur un lien (navigation effective)
  document.querySelectorAll(".navbar-link").forEach(function (link) {
    link.addEventListener("click", function () {
      navbar.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    });
  });
})();
