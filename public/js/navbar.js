document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
  
    if (!menuToggle || !mobileMenu || !menuOverlay) {
      console.log('Elementos del menú no encontrados. Verifica la estructura del HTML.');
      return;
    }
  
    console.log('Navbar script cargado correctamente.');
  
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuOverlay.classList.toggle('open');
      console.log('Menú móvil: ', mobileMenu.classList.contains('open') ? 'abierto' : 'cerrado');
    });
  
    menuOverlay.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
      console.log('Menú móvil cerrado via overlay.');
    });
  });
  