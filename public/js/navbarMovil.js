document.addEventListener('DOMContentLoaded', function() {
    window.toggleMenu = function() {
      var menu = document.getElementById("mobileMenu");
      if (!menu) return;
      menu.style.display = (window.getComputedStyle(menu).display === "block") ? "none" : "block";
    }
  });
  