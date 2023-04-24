import { Router } from "express";
//importo mis rutas.ts
import usuario from './usuario';

const routes = Router();

//aqui defino las rutas

routes.use('/usuarios',usuario);


export default routes;