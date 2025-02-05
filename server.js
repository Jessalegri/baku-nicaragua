require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.url.endsWith('.html')) {
        const newUrl = req.url.slice(0, -5); 
        console.log(`Redirigiendo ${req.url} → ${newUrl}`);
        return res.redirect(301, newUrl);
    }
    next(); 
});

// Configuración de archivos estáticos
app.use(express.static('public', {
    extensions: ['html'],
}));

app.use((req, res, next) => {
    if (req.url === '/san-juan-del-sur') {
        console.log(`Redirigiendo ${req.url} → /sanjuandelsur`);
        return res.redirect(301, '/sanjuandelsur');
    }
    next();
});
// SJDS.html para navbar
app.get('/sanjuandelsur', (req, res) => {
    res.render('SJDS');
});

// Ruta para servir sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(__dirname + '/sitemap.xml');
});

// Ruta para servir granada.html
app.get('/granada', (req, res) => {
    res.sendFile(__dirname + '/public/granada.html');
});
// Nueva Ruta
app.get('/api/ciudades', (req, res) => {
    const query = 'SELECT nombre_ciudad FROM Ciudades';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener las ciudades:', error);
            return res.status(500).json({ error: 'Error al obtener las ciudades' });
        }
        const ciudades = results.map(row => row.nombre_ciudad); // Extrae solo los nombres
        res.json(ciudades);
    });
});

// Ruta personalizada para servir san-juan-del-sur.html en /sanjuandelsur
app.get('/sanjuandelsur', (req, res) => {
    res.sendFile(__dirname + '/public/san-juan-del-sur.html');
});


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

// Rutas personalizadas
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/sobreBaku', (req, res) => {
    res.render('sobreBaku', { title: 'Acerca de Baku' });
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html');
});

// Ruta para renderizar terminales.ejs
app.get('/terminales', (req, res) => {
    // Si necesitas pasar datos a la vista, aquí es donde lo harías
    res.render('terminales', { title: 'Terminales', terminales: [] }); // Enviar terminales vacío por defecto si no hay datos
});


// Ruta para mostrar el formulario de agregar horario de autobús
app.get('/agregarHorario', (req, res) => {
    res.render('agregarHorario', { title: 'Agregar Horario' });
});

// Ruta para rendirizar navbar en archivo html
app.get('/navbar-for-san-juan', (req, res) => {
    res.render('navbar'); // Renderiza el archivo navbar.ejs como HTML
});
// Ruta para rendirizar navbar en archivo contacto.html
app.get('/navbar', (req, res) => {
    res.render('navbar'); // Renderiza navbar.ejs como HTML
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

// Trabajando en: TERMINALES:
app.get('/nueva-terminal', (req, res) => {
    // Obtener todas las ciudades
    const query = 'SELECT ciudad_id, nombre_ciudad FROM Ciudades';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener las ciudades:', error);
            return res.status(500).send('Error al cargar las ciudades.');
        }

        // Obtener la ciudad seleccionada desde la query string
        const ciudadSeleccionada = req.query.ciudad || '';
        let terminales = [];

        // Obtener las terminales solo si hay una ciudad seleccionada
        if (ciudadSeleccionada) {
            const terminalQuery = 'SELECT nombre_terminal FROM Terminales WHERE ciudad_id = (SELECT ciudad_id FROM Ciudades WHERE nombre_ciudad = ?)';
            pool.query(terminalQuery, [ciudadSeleccionada], (error, terminalResults) => {
                if (error) {
                    console.error('Error al obtener las terminales:', error);
                    return res.status(500).send('Error al obtener las terminales');
                }
                terminales = terminalResults;
                // Renderizamos la vista pasando las ciudades, terminales y la ciudad seleccionada
                res.render('nuevaTerminal', { ciudades: results, terminales, ciudadSeleccionada });
            });
        } else {
            // Si no hay ciudad seleccionada, solo pasamos las ciudades y un array vacío de terminales
            res.render('nuevaTerminal', { ciudades: results, terminales, ciudadSeleccionada });
        }
    });
});

// Ruta POST para agregar una nueva terminal
app.post('/nueva-terminal', (req, res) => {
    const { nombre_terminal, ciudad } = req.body;

    // Verificar si la ciudad existe en la base de datos
    const ciudadQuery = 'SELECT ciudad_id FROM Ciudades WHERE nombre_ciudad = ?';
    pool.query(ciudadQuery, [ciudad], (error, results) => {
        if (error) {
            console.error('Error al verificar la ciudad:', error);
            return res.status(500).send('Error al verificar la ciudad.');
        }

        if (results.length > 0) {
            const ciudadId = results[0].ciudad_id;

            // Verificar si la terminal ya existe en la ciudad seleccionada
            const terminalQuery = 'SELECT * FROM Terminales WHERE nombre_terminal = ? AND ciudad_id = ?';
            pool.query(terminalQuery, [nombre_terminal, ciudadId], (error, results) => {
                if (error) {
                    console.error('Error al verificar la terminal:', error);
                    return res.status(500).send('Error al verificar la terminal.');
                }

                if (results.length > 0) {
                    // Si la terminal ya existe, redirigir con un mensaje
                    return res.redirect('/confirmacion-terminales?mensaje=La terminal ya existe en esta ciudad.');
                }

                // Si la terminal no existe, agregarla
                agregarNuevaTerminal(nombre_terminal, ciudadId, res);
            });
        } else {
            // Si la ciudad no existe, crearla primero
            const insertCiudadQuery = 'INSERT INTO Ciudades (nombre_ciudad) VALUES (?)';
            pool.query(insertCiudadQuery, [ciudad], (error, insertResult) => {
                if (error) {
                    console.error('Error al agregar la ciudad:', error);
                    return res.status(500).send('Error al agregar la ciudad.');
                }
                const ciudadId = insertResult.insertId;
                agregarNuevaTerminal(nombre_terminal, ciudadId, res);
            });
        }
    });
});

// Función auxiliar para insertar la terminal
function agregarNuevaTerminal(nombre_terminal, ciudadId, res) {
    const insertTerminalQuery = 'INSERT INTO Terminales (nombre_terminal, ciudad_id) VALUES (?, ?)';
    pool.query(insertTerminalQuery, [nombre_terminal, ciudadId], (error) => {
        if (error) {
            console.error('Error al agregar la terminal:', error);
            return res.status(500).send('Error al agregar la terminal.');
        }
        res.redirect('/confirmacion-terminales?mensaje=Terminal agregada con éxito');
    });
}
// Ruta para obtener terminales por ciudad
app.get('/nueva-terminal', (req, res) => {
    // Obtener todas las ciudades
    const query = 'SELECT ciudad_id, nombre_ciudad FROM Ciudades';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener las ciudades:', error);
            return res.status(500).send('Error al cargar las ciudades.');
        }

        // Obtener las terminales si la ciudad está seleccionada
        const ciudadSeleccionada = req.query.ciudad || '';
        let terminales = [];

        if (ciudadSeleccionada) {
            const terminalQuery = 'SELECT nombre_terminal FROM Terminales WHERE ciudad_id = (SELECT ciudad_id FROM Ciudades WHERE nombre_ciudad = ?)';
            pool.query(terminalQuery, [ciudadSeleccionada], (error, terminalResults) => {
                if (error) {
                    console.error('Error al obtener las terminales:', error);
                    return res.status(500).send('Error al obtener las terminales');
                }
                terminales = terminalResults;
                // Renderizamos la vista pasando las ciudades y terminales
                res.render('nuevaTerminal', { ciudades: results, terminales });
            });
        } else {
            // Si no hay ciudad seleccionada, pasamos la lista vacía de terminales
            res.render('nuevaTerminal', { ciudades: results, terminales });
        }
    });
});


app.get('/confirmacion-terminales', (req, res) => {
    const mensaje = req.query.mensaje || 'Operación exitosa.';
    res.render('confirmacionTerminales', { mensaje });
});

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
    const query = `
        SELECT 
            horario_id,
            terminal_origen_id,
            terminal_destino_id,
            DATE_FORMAT(hora_salida, '%h:%i %p') AS hora_salida, -- Formato AM/PM
            duracion_viaje
        FROM horarios_de_buses
    `;
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener los horarios:', error);
            return res.status(500).json({ error: 'Error al obtener los horarios' });
        }

        // Renderiza la vista con los horarios en formato AM/PM
        res.render('terminales', { title: 'Terminales', horarios: results });
    });
});

// Ruta para buscar horarios de buses
app.post('/buscar-horarios', (req, res) => {
    const { ciudadOrigen, ciudadDestino } = req.body;

    if (!ciudadOrigen || !ciudadDestino) {
        return res.status(400).send('Por favor seleccione una ciudad de origen y destino.');
    }

    const query = `
        SELECT 
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
        WHERE c_origen.nombre_ciudad = ? AND c_destino.nombre_ciudad = ?
    `;

    pool.query(query, [ciudadOrigen, ciudadDestino], (error, results) => {
        if (error) {
            console.error('Error al buscar horarios:', error);
            return res.status(500).send('Error al buscar horarios');
        }
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
// Calificaciones 
// Ruta para seleccionar la ciudad antes de calificar un horario
app.get('/seleccionar-ciudad', (req, res) => {
    const query = 'SELECT ciudad_id, nombre_ciudad FROM Ciudades';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener las ciudades:', error);
            return res.status(500).json({ error: 'Error al obtener las ciudades' });
        }
        res.render('seleccionar-ciudad', { title: 'Seleccionar Ciudad', ciudades: results });
    });
});

// Ruta para mostrar los horarios de la ciudad seleccionada
app.get('/ver-horarios/:ciudadId', (req, res) => {
    const ciudadId = req.params.ciudadId;
    const query = `
        SELECT 
            h.horario_id,
            t_origen.nombre_terminal AS terminal_origen,
            t_destino.nombre_terminal AS terminal_destino,
            h.hora_salida,
            h.duracion_viaje
        FROM horarios_de_buses h
        JOIN Terminales t_origen ON h.terminal_origen_id = t_origen.terminal_id
        JOIN Terminales t_destino ON h.terminal_destino_id = t_destino.terminal_id
        WHERE t_origen.ciudad_id = ? OR t_destino.ciudad_id = ?
    `;
    pool.query(query, [ciudadId, ciudadId], (error, results) => {
        if (error) {
            console.error('Error al obtener los horarios:', error);
            return res.status(500).json({ error: 'Error al obtener los horarios' });
        }
        res.json(results);
    });
});
// Pagina en desarrollo
app.get('/enDesarrollo', (req, res) => {
    res.render('enDesarrollo');
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
        res.render('calificar-horario', { title: 'Calificar Horario', horario });

    });
});

// Ruta para guardar la calificación
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
        // Redirigir a la página de confirmación con mensaje de éxito
        res.redirect('/confirmacion?mensaje=Calificación agregada con éxito');
    });
});
// Ruta para manejar las suscripciones al newsletter
app.post('/subscribe', (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).send('El correo electrónico es obligatorio.');
    }

    const query = 'INSERT INTO NewsletterSubscribers (email) VALUES (?)';
    pool.query(query, [email], (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.redirect('/suscripcion?mensaje=Ya estás suscrito.');
            }
            console.error('Error al insertar en la tabla NewsletterSubscribers:', error);
            return res.status(500).send('Hubo un error al registrar tu correo.');
        }

        res.redirect('/suscripcion');
    });
});

app.get('/suscripcion', (req, res) => {
    res.render('suscripcion'); // Renderiza el archivo suscripcion.ejs
});



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
app.get('/sobreBaku', (req, res) => {
    res.render('sobreBaku', { title: 'Acerca de Baku' });
});
app.get('/hoteles', (req, res) => {
    res.render('hoteles', { title: 'Nuestros hoteles favoritos en Nicaragua' });
});
