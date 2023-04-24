import {getRepository} from "typeorm";
import {Request,Response,NextFunction} from "express";
import {Login} from "../entity/Login";
import { Usuario } from "../entity/Usuario";

export const checkRole = (roles:Array<string>) => {

    return async  (req:Request,res:Response,next:NextFunction) => {
        const {userId} = res.locals.jwtPayload;
        const usuarioRepositorio = getRepository(Usuario);
        let usuario:Usuario;

        try{
            usuario = await  usuarioRepositorio.findOneOrFail(userId);
        }
        catch (err){
            return res.status(401).json({message:'el rol no es correcto',
                                                    error: err.message});
        }

        const {rol} = usuario;
        console.log('login',usuario);
        if(roles.includes(rol)){
            next();
        }
        else{
            res.status(401).json({message:'No autorizado'});
        }
    };

};
