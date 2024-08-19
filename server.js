require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const mysql = require('mysql2');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database', err);
        return;
    }
    console.log('Connected to the database');
    connection.release();
});

// Ruta principal para servir la página inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); 
});
// Ruta para la página "Sobre Baku"
app.get('/sobreBaku', (req, res) => {
    res.render('sobreBaku', { title: 'Acerca de Baku' });
});
// Ruta para mostrar el formulario de agregar horario de autobús
app.get('/agregarHorario', (req, res) => {
    res.render('agregarHorario', { title: 'Agregar Horario' });
});

// Ruta para mostrar la página de confirmación
app.get('/confirmacion', (req, res) => {
    const mensaje = req.query.mensaje || '';
    res.render('confirmacion', { mensaje });
});


// Función para agregar una ciudad y devolver su ID
const agregarCiudad = (nombreCiudad, callback) => {
    const query = 'SELECT ciudad_id FROM Ciudades WHERE nombre_ciudad = ?';
    pool.query(query, [nombreCiudad], (error, results) => {
        if (error) return callback(error);

        if (results.length > 0) {
            return callback(null, results[0].ciudad_id);
        } else {
            const insertQuery = 'INSERT INTO Ciudades (nombre_ciudad) VALUES (?)';
            pool.query(insertQuery, [nombreCiudad], (error, results) => {
                if (error) return callback(error);
                return callback(null, results.insertId);
            });
        }
    });
};

// Función para agregar una terminal y devolver su ID
const agregarTerminal = (nombreTerminal, ciudadId, callback) => {
    const query = 'SELECT terminal_id FROM Terminales WHERE nombre_terminal = ? AND ciudad_id = ?';
    pool.query(query, [nombreTerminal, ciudadId], (error, results) => {
        if (error) return callback(error);

        if (results.length > 0) {
            return callback(null, results[0].terminal_id);
        } else {
            const insertQuery = 'INSERT INTO Terminales (nombre_terminal, ciudad_id) VALUES (?, ?)';
            pool.query(insertQuery, [nombreTerminal, ciudadId], (error, results) => {
                if (error) return callback(error);
                return callback(null, results.insertId);
            });
        }
    });
};

// Ruta para procesar la solicitud de agregar horario de autobús
app.post('/agregar-horario', (req, res) => {
    const { ciudadOrigen, terminalOrigen, ciudadDestino, terminalDestino, horaSalida, duracionViajeHoras, duracionViajeMinutos, calificacion } = req.body;

    // Convertir la duración del viaje a formato HH:MM:SS
    const duracionViajeFormato = `${String(duracionViajeHoras).padStart(2, '0')}:${String(duracionViajeMinutos).padStart(2, '0')}:00`;

    // Asegurar que las ciudades existan y obtener sus IDs
    agregarCiudad(ciudadOrigen, (error, ciudadOrigenId) => {
        if (error) {
            console.error('Error al agregar la ciudad de origen:', error);
            return res.status(500).json({ error: 'Error al agregar la ciudad de origen' });
        }
        
        agregarCiudad(ciudadDestino, (error, ciudadDestinoId) => {
            if (error) {
                console.error('Error al agregar la ciudad de destino:', error);
                return res.status(500).json({ error: 'Error al agregar la ciudad de destino' });
            }

            // Asegurar que las terminales existan y obtener sus IDs
            agregarTerminal(terminalOrigen, ciudadOrigenId, (error, terminalOrigenId) => {
                if (error) {
                    console.error('Error al agregar la terminal de origen:', error);
                    return res.status(500).json({ error: 'Error al agregar la terminal de origen' });
                }

                agregarTerminal(terminalDestino, ciudadDestinoId, (error, terminalDestinoId) => {
                    if (error) {
                        console.error('Error al agregar la terminal de destino:', error);
                        return res.status(500).json({ error: 'Error al agregar la terminal de destino' });
                    }

                    // Insertar el nuevo horario en la base de datos
                    const query = `
                        INSERT INTO horarios_de_buses (terminal_origen_id, terminal_destino_id, hora_salida, duracion_viaje)
                        VALUES (?, ?, ?, ?)
                    `;
                    pool.query(query, [terminalOrigenId, terminalDestinoId, horaSalida, duracionViajeFormato], (error, results) => {
                        if (error) {
                            console.error('Error al agregar el horario:', error);
                            return res.status(500).json({ error: 'Error al agregar el horario' });
                        }
                        
                        // Obtener el ID del horario insertado
                        const horarioId = results.insertId;
                        
                        // Insertar la calificación correspondiente
                        const insertCalificacionQuery = `
                            INSERT INTO Calificaciones (horario_id, calificacion)
                            VALUES (?, ?)
                        `;
                        pool.query(insertCalificacionQuery, [horarioId, calificacion], (error, results) => {
                            if (error) {
                                console.error('Error al agregar la calificación:', error);
                                return res.status(500).json({ error: 'Error al agregar la calificación' });
                            }
                            
                            // Mensaje en la terminal
                            console.log('Horario y calificación agregados correctamente');

                            // Redirigir a la página de confirmación con mensaje de éxito
                            res.redirect('/confirmacion?mensaje=Horario agregado con éxito');
                        });
                    });
                });
            });
        });
    });
});

// Ruta para la página de "Terminales"
app.get('/terminales', (req, res) => {
    const query = 'SELECT * FROM horarios_de_buses';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener los horarios:', error);
            return res.status(500).json({ error: 'Error al obtener los horarios' });
        }
        res.render('terminales', { title: 'Terminales', horarios: results });
    });
});

// Ruta para buscar horarios de buses
app.post('/buscar-horarios', (req, res) => {
    const { ciudadOrigen, ciudadDestino } = req.body;
    const query = `
        SELECT 
            c_origen.nombre_ciudad AS ciudad_origen,
            c_destino.nombre_ciudad AS ciudad_destino,
            t_origen.nombre_terminal AS terminal_origen,
            t_destino.nombre_terminal AS terminal_destino,
            h.hora_salida,
            h.duracion_viaje,
            c.calificacion
        FROM horarios_de_buses h
        LEFT JOIN Calificaciones c ON h.horario_id = c.horario_id
        JOIN Terminales t_origen ON h.terminal_origen_id = t_origen.terminal_id
        JOIN Terminales t_destino ON h.terminal_destino_id = t_destino.terminal_id
        JOIN Ciudades c_origen ON t_origen.ciudad_id = c_origen.ciudad_id
        JOIN Ciudades c_destino ON t_destino.ciudad_id = c_destino.ciudad_id
        WHERE c_origen.nombre_ciudad = ? AND c_destino.nombre_ciudad = ?
    `;
    pool.query(query, [ciudadOrigen, ciudadDestino], (error, results) => {
        if (error) {
            console.error('Error al realizar la consulta', error);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        console.log('Query results:', results); // Aquí results está definido
        res.json(results);
    });
});

// Ruta para buscar terminales
app.get('/buscar-terminales', (req, res) => {
    const searchQuery = req.query.search;
    const query = `
        SELECT *
        FROM Terminales
        WHERE nombre_terminal LIKE ?
    `;
    const searchPattern = `%${searchQuery}%`;
    pool.query(query, [searchPattern], (error, results) => {
        if (error) {
            console.error('Error al realizar la consulta de terminales', error);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.render('terminales', { title: 'Terminales', terminales: results });
    });
});

// Ruta para mostrar el formulario de calificación
app.get('/calificar-horario/:id', (req, res) => {
    const horarioId = req.params.id;

    const query = `
        SELECT 
            h.horario_id,
            c_origen.nombre_ciudad AS ciudad_origen,
            c_destino.nombre_ciudad AS ciudad_destino,
            t_origen.nombre_terminal AS terminal_origen,
            t_destino.nombre_terminal AS terminal_destino,
            h.hora_salida,
            h.duracion_viaje
        FROM horarios_de_buses h
        JOIN Terminales t_origen ON h.terminal_origen_id = t_origen.terminal_id
        JOIN Terminales t_destino ON h.terminal_destino_id = t_destino.terminal_id
        JOIN Ciudades c_origen ON t_origen.ciudad_id = c_origen.ciudad_id
        JOIN Ciudades c_destino ON t_destino.ciudad_id = c_destino.ciudad_id
        WHERE h.horario_id = ?
    `;

    pool.query(query, [horarioId], (error, results) => {
        if (error) {
            console.error('Error al obtener el horario:', error);
            return res.status(500).json({ error: 'Error al obtener el horario' });
        }

        if (results.length === 0) {
            return res.status(404).send('Horario no encontrado');
        }

        const horario = results[0];
        res.render('calificar-horarios', { title: 'Calificar Horario', horario });
    });
});

// Ruta para guardar calificaciones
app.post('/submit-calificacion', (req, res) => {
    const { horario_id, calificacion } = req.body;

    const query = `
        INSERT INTO Calificaciones (horario_id, calificacion)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE calificacion = ?
    `;

    pool.query(query, [horario_id, calificacion, calificacion], (error, results) => {
        if (error) {
            console.error('Error al actualizar la calificación:', error);
            return res.status(500).json({ error: 'Error al actualizar la calificación' });
        }
        res.redirect('/'); // Redirigir a la página de inicio u otra página deseada después de calificar
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});