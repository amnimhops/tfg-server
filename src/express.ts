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
    const STATIC_FOLDER = process.env.STATIC_FOLDER;
    if(!STATIC_FOLDER) throw new Error("Static folder not found");

    app.use(express.json({
        limit:'5mb' // Necesario para la subida de imágenes
    }));
    app.use(cors(corsOpts));
    
    app.use('/websocket',wsRouter.ws('/',wsHandler));
    app.use('/',apiRouter);
    // recursos graficos
    //app.use('/static', express.static(__dirname + '/public'));
    console.log('Asset folder found at',STATIC_FOLDER);
    app.use('/public', express.static(STATIC_FOLDER));
    app.use('/backoffice', express.static(STATIC_FOLDER+"backoffice/"));

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
