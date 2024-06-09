document.addEventListener('DOMContentLoaded', function() {
    const resultadosDiv = document.getElementById('resultados');
    const resultados = JSON.parse(localStorage.getItem('horariosResultados')) || [];

    resultadosDiv.innerHTML = ''; 
    resultados.forEach(horario => {
        const p = document.createElement('p');
        p.innerHTML = `
            <strong>Ciudad Origen:</strong> ${horario.ciudad_origen} <br>
            <strong>Terminal Origen:</strong> ${horario.terminal_origen} <br>
            <strong>Ciudad Destino:</strong> ${horario.ciudad_destino} <br>
            <strong>Terminal Destino:</strong> ${horario.terminal_destino} <br>
            <strong>Hora de salida:</strong> ${horario.hora_salida} <br>
            <strong>Duración:</strong> ${horario.duracion_viaje} <br>
        `;
        resultadosDiv.appendChild(p);
    });
});
