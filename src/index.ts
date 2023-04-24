
import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import {Request, Response} from "express";
import * as cors from 'cors';
import * as helmet from 'helmet';
import routes from "./routes"
import * as  bodyParser from "body-parser";

/* variable con el puerto en caso que la aplicación , se haga un deploy se va a utilizar una variable de entorno del puerto
* y si estamos en dllo utilizamos el puerto 3000*/
const PORT = process.env.port || 3000;

createConnection().then(async () => {

    // create express app
    const app = express();
    //Middlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(express.json());

    //Routes
    app.use('/',routes);

    // start express server
    app.listen(PORT,() => console.log(`SERVIDOR CORRIENDO EN EL PUERTO ${PORT}`));



}).catch(error => console.log(error));