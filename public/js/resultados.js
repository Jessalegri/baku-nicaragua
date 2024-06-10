document.addEventListener('DOMContentLoaded', function() {
    const resultadosDiv = document.getElementById('resultados');
    const resultados = JSON.parse(localStorage.getItem('horariosResultados')) || [];

    resultadosDiv.innerHTML = ''; 
    resultados.forEach(horario => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = `
            <p><strong>Ciudad Origen:</strong> ${horario.ciudad_origen}</p>
            <p><strong>Terminal Origen:</strong> ${horario.terminal_origen}</p>
            <p><strong>Ciudad Destino:</strong> ${horario.ciudad_destino}</p>
            <p><strong>Terminal Destino:</strong> ${horario.terminal_destino}</p>
            <p><strong>Hora de salida:</strong> ${horario.hora_salida}</p>
            <p><strong>Duración:</strong> ${horario.duracion_viaje}</p>
        `;
        resultadosDiv.appendChild(resultDiv);
    });
});
