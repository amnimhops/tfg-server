import * as express from 'express';
import { Server } from 'http';
import * as expressWs from 'express-ws';
import * as cors from 'cors'
import path = require('path');
import { wsHandler } from './websocket';

// La configuración del módulo CORS por defecto no permite PATCH, así que lo PATCHeamos
const corsOpts = {
    "origin": "*",
    /* No deja de ser interesante que la configuración de CORS del navegador
     * sea sensible a mayúsculas...ojo con cuadrar los strings de los métodos
     * de fetch con los aquí definidos
     */
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}
const app = express();
const ews = expressWs(app);
const wsRouter = express.Router() as expressWs.Router;
const port = process.env.PORT || 3000;

let server:Server = null;



export function startExpress(apiRouter:express.Router){
    const ASSETS_FOLDER = process.env.assetsFolder || '../../../web/src/assets';
    app.use(express.json());
    app.use(cors(corsOpts));
    app.use('/websocket',wsRouter.ws('/',wsHandler));
    app.use('/',apiRouter);
    // recursos graficos
    //app.use('/static', express.static(__dirname + '/public'));
    app.use('/assets', express.static(path.join(__dirname,ASSETS_FOLDER)));

    server = app.listen(port);    

    console.info('Servicio web iniciado');
}

export async function stopExpress(){
    return new Promise( (resolve: (value:any)=>void, reject:(reason?:any)=>void) => {
        server.close( (err) => {
            if(err) reject(err);
            else(resolve('Servicio web finalizado'));
        });
    });
}
