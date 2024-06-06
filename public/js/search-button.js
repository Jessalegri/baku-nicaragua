document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-busqueda'); 
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();  
        const origen = document.getElementById('buscar-desde').value.trim();
        const destino = document.getElementById('buscar-hasta').value.trim();

        fetch('http://localhost:3001/buscar-horarios', {
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
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al procesar su solicitud. Por favor, intente de nuevo.');
        });
    });

    function displayResults(data) {
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = ''; 
        data.forEach(horario => {
            const p = document.createElement('p');
            p.textContent = `Hora de salida: ${horario.hora_salida}, Duración: ${horario.duracion_viaje}`;
            resultadosDiv.appendChild(p);
        });
    }
});
