document.addEventListener('DOMContentLoaded', function() {
    window.toggleMenu = function() {
      var menu = document.getElementById("mobileMenu");
      var overlay = document.getElementById("menuOverlay");
      if (!menu) return;
      // Alterna rápidamente entre mostrar y ocultar
      if (window.getComputedStyle(menu).display === "block") {
        menu.style.display = "none";
        overlay.style.display = "none";
      } else {
        menu.style.display = "block";
        overlay.style.display = "block";
      }
    }
  });