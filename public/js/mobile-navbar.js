document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    // Alternar la clase "open" al hacer clic en el botón ☰
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });

    // Cerrar el menú si se hace clic fuera del menú o del botón ☰
    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
            menu.classList.remove('open');
        }
    });
});
