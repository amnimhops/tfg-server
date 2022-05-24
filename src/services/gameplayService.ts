import { ActivityTarget, ActivityType, Asset, CellInstance, EnqueuedActivity, Game, InstancePlayer, Message, MessageType, SearchResult, TradingAgreement, WorldMapQuery, WorldMapSector } from '../models/monolyth';
import { ActivityAvailability } from '../models/activities';
import { addInstance, getInstance, getInstances, LiveGameInstance } from '../live/instances';
import { getLoggedUser,bindPlayer, getLoggedPlayer } from '../live/sessions';

import { Collections, Connection, Repository } from '../persistence/repository';
import { ServiceError, ServiceErrorCode } from '../models/errors';

/**
 * Funcion que devuelve una promesa con el resultado de la
 * operación de usuario suministrada como parámetro. El cometido
 * principal de esta es alimentar al callback con los datos
 * que de otra manera habría que repetir en cada solicitud
 * @param token Cadena de autenticación del usuario
 * @param callback Función que se ejecutará con el jugador e instancia
 * correspondientes a la cadena de autenticación facilitada
 * @returns Una promesa del mismo tipo que el que devuelve el callback suministrado.
 */
function withPlayer<T>(token:string,callback:(player:InstancePlayer,instance:LiveGameInstance)=>T):Promise<T>{
    return new Promise( (resolve,reject) => {
        const player = getLoggedPlayer(token);
        const instance = getInstance(player.instanceId);

        try{
            resolve(callback(player,instance));
        }catch(err){
            console.trace(err);
            reject(err);
        }        
    });
}

export interface IGameplayService{
    joinGame(token:string,gameId:string):Promise<Asset[]>;
    getGameData(token:string):Promise<Game>;
    getCells(token:string):Promise<CellInstance[]>;
    startActivity(token:string, type:ActivityType,target:ActivityTarget):Promise<EnqueuedActivity>
    getQueue(token:string,type?:ActivityType):Promise<EnqueuedActivity[]>
    cancelActivity(token: string, id:number):Promise<void>
    changeActivityOrder(token:string, id:number,offset:number):Promise<void>
    getWorldMap(token:string, query:WorldMapQuery):Promise<WorldMapSector>
    getInstancePlayer(token:string, id?:string):Promise<Partial<InstancePlayer>>
    getMessages(token:string, text:string, type: MessageType, page: number): Promise<SearchResult<Message>>
    sendMessage(token:string, dstPlayerId:string,subject:string,message:string):Promise<string>
    sendTradeAgreement(token:string, agreement:TradingAgreement):Promise<string>
    cancelTradeAgreement(token:string, id:number):Promise<void>
    acceptTradeAgreement(token:string,id:number):Promise<void>
    getTradingAgreement(token:string,id:number):Promise<TradingAgreement>
    deleteMessage(token:string, id:number):Promise<void>

}

export class GameplayService implements IGameplayService{
    constructor(private connection:Connection){

    }

    joinGame(token:string,gameId:string):Promise<Asset[]>{
        return new Promise( (resolve,reject) => {
            const user = getLoggedUser(token);
            const instances = getInstances().filter( instance => instance.gameId == gameId) || [];
            let instance = instances.find( instance => instance.getPlayer(user.id!) != undefined);
            let player = null;

            // El jugador no está presente en ninguna instancia del juego, habrá que vincularlo
            if(!instance){
                instance = instances.find( i => i.canAddNewPlayers());
                if(!instance){
                    // TODO Crear una nueva instancia
                    reject(<ServiceError>{code:ServiceErrorCode.ServerError,message:'No hay instancias libres para agregar más jugadores'});
                }else{
                    // Creamos el jugador
                    player = instance.createPlayer(user);
                }
            }else{
                player = instance.getPlayer(user.id);
            }
            // En este punto, o bien el jugador ya estaba en una instancia o acaba de añadirse
            // Solo queda vincular la instancia del jugador con la sesión y devolver los recursos
            // audiovisuales.
            bindPlayer(token,player);
            resolve(instance.getAssets());
        });
    }

    getGameData(token:string):Promise<Game>{
        return withPlayer(token, (player,instance) => instance.getGameData() );
    }
    
    getCells(token:string):Promise<CellInstance[]>{
        return withPlayer<CellInstance[]>( token, (player,instance) => instance.getCells(player));
    }

    startActivity(token:string, type:ActivityType,target:ActivityTarget):Promise<EnqueuedActivity>{
        return withPlayer<EnqueuedActivity>( token, (player,instance) => instance.startActivity(player,type,target));
    }
    
    getQueue(token:string,type?:ActivityType):Promise<EnqueuedActivity[]>{
        return withPlayer<EnqueuedActivity[]>( token, (player,instance) => instance.getActivities(player,type) );
    }
    
    cancelActivity(token: string, id:number):Promise<void>{
        return withPlayer<void>( token, (player,instance) => instance.cancelActivity(player,id) );
    }
   
    changeActivityOrder(token:string, id:number,offset:number):Promise<void>{
        return withPlayer<void>( token, (player,instance) => instance.changeActivityOrder(player,id,offset) );
    }
    
    getWorldMap(token:string, query:WorldMapQuery):Promise<WorldMapSector>{
        return withPlayer<WorldMapSector>( token, (player,instance) => instance.getWorldMap(query));
    }
    
    getInstancePlayer(token:string, id?:string):Promise<Partial<InstancePlayer>>{
        return withPlayer<Partial<InstancePlayer>>( token, (player,instance) => {
            if(id){
                return instance.getInstancePlayer(id)
            }else{
                // Al pedir el jugador su propia información, va con todo: colas, almacenes, celdas, etc.
                return player;
            }
        });
    }
    
    getMessages(token:string, text:string, type: MessageType, page: number): Promise<SearchResult<Message>>{
        return withPlayer<SearchResult<Message>>( token, (player,instance) => 
            instance.getMessages(player,text,type,page)
        );
    }
    
    sendMessage(token:string, dstPlayerId:string,subject:string,message:string):Promise<string> {
        // Express.js da problemas si se devuelve un número, al tomarlo como una sobrecaga de res.send()
        // con código de error, e interpreta el número como tal. Por eso hacemos el casting intermedio.l
        return withPlayer<string>( token, (player,instance) => instance.sendMessage(player,dstPlayerId,subject,message).toString())
    }
    
    sendTradeAgreement(token:string, agreement:TradingAgreement):Promise<string>{
        return withPlayer<string>( token, (player,instance) => instance.sendTradeAgreement(agreement).toString() );
    };
    
    cancelTradeAgreement(token:string, id:number):Promise<void>{
        return withPlayer<void>( token, (player,instance) => instance.cancelTradeAgreement(player,id) );
    }
    
    acceptTradeAgreement(token:string,id:number):Promise<void>{
        return withPlayer<void>( token, (player,instance) => instance.acceptTradeAgreement(player,id) );
    }
    
    getTradingAgreement(token:string,id:number):Promise<TradingAgreement>{
        return withPlayer<TradingAgreement>( token, (player,instance) => instance.getTradingAgreement(player,id) );
    }
    
    deleteMessage(token:string, id:number):Promise<void>{
        return withPlayer<void>( token, (player,instance) => instance.deleteMessage(player,id) );
    }
}