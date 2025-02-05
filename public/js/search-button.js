document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('buscar-transporte');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const origen = document.getElementById('buscar-desde').value.trim();
        const destino = document.getElementById('buscar-hasta').value.trim();

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
            localStorage.setItem('horariosResultados', JSON.stringify(data));
            window.location.href = 'resultados.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al procesar su solicitud. Por favor, intente de nuevo.');
        });
    });
});
