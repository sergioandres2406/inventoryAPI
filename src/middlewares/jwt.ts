import {Request,Response, NextFunction} from "express";
import  * as jwt from 'jsonwebtoken';
import config from "../config/config";

export const checkJwt = (req:Request,res:Response,next:NextFunction) => {

    // declaro una constante llamada token, que será un string, que va a esperar un parámetro que se llama auth en el header de la peticion,
    const token = <string>req.headers['token'];
    let jwtPayload;
    // console.log('token',token);
    // console.log('REQ ->',req.headers['token']);
    try{
        // le llevamos al parametro  jwtPayload, le pasamos el token y como segundo parametro la key
        //utilizamos dos metodos,  el verify, que le pasamos nuestro token y el secret, y el sign
        //que devuelve en base a las opciones que le pasamos.  y el secret nos a a devolver el token generado
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    }
    catch (err){
        // no enviamos nada
        res.status(401).json({message:'No está autorizado (jwt)',
                                        detalle: err.message});
    }

    //extraemos el userid y el username de jwtPayload
    const { userId,username } = jwtPayload;

    const newToken = jwt.sign({userId,username},config.jwtSecret,{expiresIn:'120h'});
    res.setHeader('token',newToken);
    //call next
    next();

}
