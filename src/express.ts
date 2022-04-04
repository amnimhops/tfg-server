import * as express from 'express';
import { Server } from 'http';
import { Connection } from './persistence/repository';
import { GameAPI } from './services/api';


const app = express();
const port = process.env.PORT || 3000;

let server:Server = null;

export function startExpress(apiRouter:express.Router){
    app.use(express.json());
    app.use('/',apiRouter);
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
