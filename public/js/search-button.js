document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buscar-transporte'); // Selecciona el formulario

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita la recarga de la página

        const origen = document.getElementById('buscar-desde').value.trim();
        const destino = document.getElementById('buscar-hasta').value.trim();

        // Realiza la solicitud fetch POST al servidor
        fetch('/buscar-horarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ciudadOrigen: origen,
                ciudadDestino: destino
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Guarda los resultados en localStorage
            localStorage.setItem('horariosResultados', JSON.stringify(data));
            // Redirige a la página de resultados
            window.location.href = 'resultados.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al procesar su solicitud. Por favor, intente de nuevo.');
        });
    });
});
