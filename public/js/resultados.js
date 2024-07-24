document.addEventListener('DOMContentLoaded', function() {
    const resultadosDiv = document.getElementById('resultados');
    const resultados = JSON.parse(localStorage.getItem('horariosResultados')) || [];

    resultadosDiv.innerHTML = '';

    if (resultados.length === 0) {
        const noResultDiv = document.createElement('div');
        noResultDiv.className = 'no-result';
        noResultDiv.innerHTML = '<h2>No se encontraron horarios disponibles.</h2>';
        resultadosDiv.appendChild(noResultDiv);
    } else {
        resultados.forEach((horario) => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'resultado-container';
            resultDiv.innerHTML = `
                <div class="ruta-bar">${horario.ciudad_origen} - ${horario.ciudad_destino}</div>
                <div class="detalles-container">
                    <div class="terminal origen">
                        <p><strong>Ciudad Origen:</strong> <span>${horario.ciudad_origen}</span></p>
                        <p><strong>Terminal Origen:</strong> <span>${horario.terminal_origen}</span></p>
                    </div>
                    <div class="horario">
                        <p><strong>Hora de salida:</strong> <span>${horario.hora_salida}</span></p>
                        <p><strong>Duración:</strong> <span>${horario.duracion_viaje}</span></p>
                    </div>
                    <div class="terminal destino">
                        <p><strong>Ciudad Destino:</strong> <span>${horario.ciudad_destino}</span></p>
                        <p><strong>Terminal Destino:</strong> <span>${horario.terminal_destino}</span></p>
                    </div>
                    <div class="calificacion">
                        <p><strong>Calificación:</strong> <span>${horario.calificacion || 'N/A'}</span></p>
                        <button class="calificar-button" onclick="window.location.href='/calificar-horario/${horario.horario_id}'">Calificar este horario</button>
                    </div>
                </div>
            `;
            resultadosDiv.appendChild(resultDiv);
        });
    }
});
