import express from 'express';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import fileUpload from 'express-fileupload';
import moment from 'moment';
import dotenv from 'dotenv';
dotenv.config();
import db from './database/config.js';
import { create } from 'express-handlebars';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import validateToken from './utils/jwtVerify.js'
import validateAdmin from './utils/adminVerify.js'

const app = express();
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 3000;
const log = console.log;

// Inicio configuracion handlebars
const hbs = create({
    partialsDir: [
        path.resolve(__dirname, './views/partials/'),
    ],
    helpers: {
        estadoClass: (estado) => {
            return estado === 'Aprobado' ? 'text-success' : 'text-secondary';
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));
// Fin configuracion handlebars

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(express.static('public'));
let maxSizeImage = 2
app.use(fileUpload({
    limits: { fileSize: maxSizeImage * 1024 * 1024 },
    abortOnLimit: true,
    limitHandler: (req, res) => {
        res.status(400).json({
            message: `Ha superado el tamaño establecido para las imágenes [${maxSizeImage} mbs.].`
        })
    }
}));

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`)
});

// Vistas publicas
app.get(['/', '/home'], async (req, res) => {
    try {
        let { rows } = await db.query('SELECT id, foto, nombre, experiencia, especialidad, estado FROM participantes ORDER BY id');
        let participantes = rows;
        res.render('home', {
            homeView: true,
            participantes
        })
    } catch (error) {
        res.status(500).render('error', {
            error: 'No fue posible mostrar la página, intente más tarde.'
        })
    };
});

app.get('/registro', (req, res) => {
    res.render('registro', {
        registroView: true
    })
});

app.get('/login', (req, res) => {
    res.render('login', {
        loginView: true
    })
});

//Vistas protegidas
app.get('/perfil', validateToken, async (req, res) => {
    try {
        let { rows } = await db.query('SELECT id, email, nombre, password, experiencia, especialidad FROM participantes WHERE id = $1', [req.participante.id])
        let participante = rows[0];
        if (participante) {
            res.render('perfil', {
                perfilView: true,
                participante
            });
        } else {
            throw new Error("No existe el participante.")
        }
    } catch (error) {
        log(error)
        res.render('perfil', {
            perfilView: true,
            error: 'No fue posible mostrar sus datos, intente más tarde.'
        })
    }
});

app.get('/administracion', validateToken, validateAdmin, async (req, res) => {
    try {
        let { rows } = await db.query('SELECT id, foto, nombre, experiencia, especialidad, estado FROM participantes ORDER BY id');
        let participantes = rows;
        res.render('admin', {
            adminView: true,
            participantes
        })
    } catch (error) {
        console.log(error);
        res.status(500).render('error', {
            error: 'No fue posible mostrar la página, intente más tarde.'
        })
    };
});

// Endpoints
app.post('/api/v1/registro', async (req, res) => {
    try {
        let { email, nombre, password, repeatPassword, experiencia, especialidad } = req.body;
        if (password != repeatPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' })
        };
        let avatar;
        if (req.files.avatar) {
            avatar = req.files.avatar;
            //log('FOTOOOOO', foto)
            log('avataaaaar', avatar)
            // Ruta donde se guardará la imagen
            let imagenType = avatar.mimetype.split('/')[1]
            let nombreArchivo = `IMG_${moment().format('YYMMDD-HHmmss')}_${nombre}.${imagenType}`
            let uploadPath = path.join(__dirname, '/public/avatars/', nombreArchivo);
            // Guardar imagen
            avatar.mv(uploadPath, (error) => {
                if (error) {
                    log(error)
                    return res.status(500).json({ message: 'No se pudo guardar la imagen en el servidor.' })
                }
            });
            //Guardar info en la base de datos
            let consulta = {
                text: 'INSERT INTO participantes (foto, nombre, email, password, experiencia, especialidad) VALUES ($1, $2, $3, $4, $5, $6) ',
                values: [`${nombreArchivo}`, nombre, email, password, experiencia, especialidad]
            };
            await db.query(consulta)
            res.status(201).json({ message: 'Participante registrado exitosamente.' })
        } else {
            let consulta = {
                text: 'INSERT INTO participantes (nombre, email, password, experiencia, especialidad) VALUES ($1, $2, $3, $4, $5) ',
                values: [nombre, email, password, experiencia, especialidad]
            };
            await db.query(consulta)
            res.status(201).json({ message: 'Participante registrado exitosamente.' })
        }
    } catch (error) {
        log(error.message)
        let message = 'Error en proceso de registro usuario';
        let status = 500;
        if (error.code == '23505') {
            message = 'Ya existe un usuario registrado con ese email.';
            status = 400;
        }
        res.status(status).json({ message })
    }
});

app.post('/api/v1/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Debe proporcionar todos los datos para la autenticación.' })
        };
        let consulta = {
            text: 'SELECT id, email, nombre FROM participantes WHERE email = $1 AND password = $2',
            values: [email, password]
        };
        let respuesta = await db.query(consulta)
        let participante = respuesta.rows[0]
        if (!participante) {
            return res.status(400).json({
                message: "Credenciales inválidas."
            })
        };
        //Generación token jwt
        const token = jwt.sign(participante, jwtSecret)
        res.status(200).json({
            message: 'Login correcto.',
            token,
            participante
        });
    } catch (error) {
        log(error.message)
        res.status(500).json({ message: 'Error en el proceso de login del participante.' })
    }
});

app.delete('/api/v1/participantes/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let consulta = {
            text: 'DELETE FROM participantes WHERE id = $1',
            values: [id]
        }
        let results = await db.query(consulta);
        if (results.rowCount == 1) {
            return res.json({
                message: `Participante con id ${id} eliminado correctamente.`
            });
        } else {
            return res.atatus(404).json({
                message: `No se encuentró al participante con id ${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar participante.' })
    }
});

//Error put. Info se actualiza en la bbdd, demora la respuesta y front muestra alert error
//token
app.put('/api/v1/participantes/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let { email, nombre, password, experiencia, especialidad } = req.body;
        let consulta = {
            text: 'UPDATE participantes SET email = $1, nombre = $2, password = $3, experiencia = $4, especialidad = $5 WHERE id = $6',
            values: [email, nombre, password, experiencia, especialidad, id]
        }
        respuesta = await db.query(consulta)
        res.status(200)
    } catch (error) {
        res.status(500)
    }
});

// Respuestas Not Found
app.all('/api/*', (req, res) => {
    res.status(404).json({
        message: 'Recurso no encontrado.'
    })
});

app.get('/*', (req, res) => {
    res.render('404', {
        message: `La ruta '${req.url}' no existe o no se encuentra disponible.`
    })
});