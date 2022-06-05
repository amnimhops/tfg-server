import { InstancePlayer, User } from "../models/monolyth";
import { ServiceError, ServiceErrorCode } from "../models/errors";

interface MessageSender{
    (message:any):void;
}


export interface Event{
    type:string;
    data:any;
}

interface Session{
    /**
     * Usuario vinculado a la sesión
     */
    user:User;
    /**
     * Vinculación con una instancia de juego. De aquí se deduce
     * que un jugador solo puede estar jugando a un juego a la vez.
     */
    instancePlayer?:InstancePlayer;

    sendMessage:MessageSender|null;
}
/**
 * Sesiones de usuarios, indexadas por hash de autenticación
 */
const sessions : Record<string,Session> = {};
/**
 * Sesiones de jugadores, indexadas por id de jugador
 */
const playerSessions : Record<string,Session> = {};

function getSession(auth:string):Session{
    if(sessions[auth] != undefined){
        return sessions[auth];
    }else{
        throw <ServiceError>{code:ServiceErrorCode.Unauthorized,message:'Token no valido'};
    }
}

export function setSession(auth:string,user:User){
    for(const key in sessions){
        if(sessions[key].user.id == user.id){
            delete playerSessions[user.id];
            delete sessions[key];
            
            break;
        }
    }

    sessions[auth] = { user, sendMessage:null };
    playerSessions[user.id] = sessions[auth];
}

export function clearSession(auth){
    if(sessions[auth]){

        delete sessions[auth];
    }else{
        throw <ServiceError>{code:ServiceErrorCode.NotFound,message:'No se ha encontrado la sesión asociada al token'};
    }
}
export function getLoggedUser(auth:string):User{
    return getSession(auth).user;
}

export function getLoggedPlayer(auth:string):InstancePlayer{
    const player = getSession(auth).instancePlayer;
    
    if(!player){
        throw <ServiceError>{code:ServiceErrorCode.NotFound,message:'El jugador no está conectado'};
    }else{
        return player;
    }
}

export function getMessageSender(playerId:string):MessageSender|null{
    const session = playerSessions[playerId];
    return session?.sendMessage || null
}
/**
 * Vincula una instancia de un jugador en una instancia
 * con la sesión de juego actual
 * @param auth Código de autenticación que identifica la sesión
 * @param player Instancia del jugador, vinculada a la instancia del juego
 */
export function bindPlayer(auth:string,player:InstancePlayer){
    const session = getSession(auth);
    session.instancePlayer = player;
}

/**
 * 
 * @param auth Vincula una instancia d eun jugador en una instnacia
 * con un manejador de mensajes. Este procedimiento sirve para transmitir
 * los eventos del servidor por un canal de comunicaciones externo como
 * websockets o cualquier otro.
 * @param handler 
 */
export function bindMessageHandler(auth:string,handler:MessageSender){
    const session = getSession(auth); // throws 401
    session.sendMessage = handler;
}
/**
 * Retira el manejador de mensajes en la sesión de un cliente. Este
 * método evita que se continuen enviando mensajes a través de un 
 * canal de comunicación cerrado.
 * @param auth 
 */
export function unbindMessageHandler(auth:string){
    const session = getSession(auth); // throws 401
    session.sendMessage = null;
}

/**
 * Devuelve el número de jugadores conectados a una instancia
 * @param id 
 * @returns 
 */
export function countInstancePlayers(id:string){
    let i = 0;
    for(const key in sessions){
        if(sessions[key].instancePlayer?.instanceId == id){
            i++;
        }
    }
    return i;
}