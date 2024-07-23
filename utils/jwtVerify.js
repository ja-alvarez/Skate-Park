import jwt from 'jsonwebtoken';
import responseFormat from './responseFormat.js';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
    try {
        let token;
        if (req.query?.token){
            token = req.query.token;
        } else if (req.headers?.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            let message = 'Recurso protegido, debe contar con credenciales válidas.';
            responseFormat(res, req.url, message, 401)
        }
        let decoded = jwt.verify(token, jwtSecret);
        req.participante = decoded;
        next();
    } catch (error) {
        let message;
        if(error.message == 'invalid signature'){
            message = 'Token inválido o caducado, vuelva a iniciar sesión.'
        } else if (error.message == 'jwt expired') {
            message = 'Su sesión ha expirado, vuelva a iniciar sesión.'
        } else {
            message = 'Error en proceso de verificación de credenciales.'
        }
        responseFormat(res, req.url, message, 500)
    }
};

export default validateToken;