import {WebsocketRequestHandler} from 'express-ws';
import {uuid} from 'uuidv4'
import {Router} from 'express';
import { Server } from "http";
import {RawData, WebSocket, WebSocketServer} from 'ws';
import { read } from 'fs';
import { InstancePlayer } from './models/monolyth';
import { bindMessageHandler, getLoggedPlayer, unbindMessageHandler } from './live/sessions';
import { ServiceError } from './models/errors';

// Usaremos https://www.npmjs.com/package/express-ws
/*let wss:WebSocketServer|null = null;

function startNotifications(server:Server){
    const wss = new WebSocketServer({ server });

    wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
    });

}

function endNotifications(){
    wss?.close();
}*/

//export const wsApiRouter = Router() as WSRouter;

enum WSAction{
    Authenticate
}
interface WSMessage{
    action:WSAction
    data:any;
}

class Client{
    private player?:InstancePlayer;
    constructor(private websocket:WebSocket){

    }
}

const connectedClients:Record<string,Client> = {};

function handleMessage<I>(ws,message:RawData){

    /*try{
        const parsedMsg = JSON.parse(message.toString()) as WSMessage;
        const action = parsedMsg.action;
        const data = parsedMsg.data;

        switch(action){
            case WSAction.Authenticate:

        }

    }catch(err){
        console.error('Error descifrando mensaje de cliente',err);
    }*/
    console.log(message);
}

/**
 * Añade un cliente a la lista de clientes activos y
 * lo deja a la espera de autenticación
 * @param ws 
 */
function acceptClient(ws:WebSocket, token:string){
    try{
        bindMessageHandler(token, (message:any)=>{
            ws.send(JSON.stringify(message));
        });
        ws.on('message',(message:RawData)=>handleMessage(ws,message));
        ws.on('close',()=>{
            try{
                unbindMessageHandler(token);
            }catch(err){
                console.error('Error fatal',err)
            }
            console.log('Se ha cerrado el websocket asociado al token',token);
        })

        console.log('Registrado websocket de jugador con token',token);
    }catch(err){
        const error = err as ServiceError;
        ws.close(error.code,error.message);
    }
}
export const wsHandler:WebsocketRequestHandler = (ws,req) => {
    const token = req.query.token as string;
    acceptClient(ws,token);
};

//wsApiRouter.ws('/',wsHandler);