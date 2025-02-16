document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  // Toggle menú móvil
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuOverlay.classList.toggle('open');
  });

  // Cierra el menú al hacer clic en el overlay
  menuOverlay.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
  });

  // Detecta el scroll y agrega/quita la clase "scrolled"
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });
});
