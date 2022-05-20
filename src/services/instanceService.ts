import { Collections, Connection, Repository } from "../persistence/repository";
import { Game, GameInstance, GameInstanceSummary, Player, SearchParams, SearchResult } from "../models/monolyth";
import { addInstance, getInstance, getInstances, getSummaries, removeInstance } from "../live/instances";
import { BasicRESTService, IRestService } from "./restService";
import { toMap } from "../models/functions";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { isNumberObject } from "util/types";

export interface IInstanceService extends IRestService<GameInstance>{
    startInstances():Promise<void>
}

const basicInstanceFields = {id:1,size:1,players:1,gameId:1,maxPlayers:1};

const START = 'start';
const STOP = 'stop';
/**
 * Devuelve una versión con los metadatos de la instancia, sin el grueso de la información
 * @param game 
 * @returns 
 */
 export function reduceInstance(instance:GameInstance):Partial<GameInstance>{
    const reduced = {};
    for(const k in basicInstanceFields) reduced[k] = instance[k];
    return reduced;
}

export class InstanceService extends BasicRESTService<GameInstance> implements IInstanceService{
    private gameStore:Repository<Game>;

    constructor(connection:Connection){
        super(connection,Collections.GameInstances);
        this.gameStore = connection.createRepository(Collections.Games);
    }

    async startInstances():Promise<void>{
        const instances = await this.find({});
        const games = await this.gameStore.find({});
        let count = 0;
        instances.forEach( instance => {
            const game = games.find( g => g.id == instance.gameId);
            addInstance(instance,game);
            count++;
        })

        console.log(count,'instancias preparadas');
    }

    /**
     * Método que recolecta información útil sobre las instancias
     * a partir de los datos de la DB y de la memoria. 
     * 
     * Nota del autor: Me habría gustado dejar este método (y otros)
     * usando el framework de agregación de MongoDB, pero hay demasiados
     * frentes abiertos y el tiempo es limitado.
     * @param params 
     */
     async searchSummaries(params:SearchParams):Promise<SearchResult<GameInstanceSummary>>{
        params.fields = basicInstanceFields;

        const games = await this.gameStore.find({},{id:true,media:true}); // para obtener los nombres de los juegos
        const gameMap:Record<string,Game> = toMap(games, game => game.id);
        const livingInstanceStats = getSummaries();
        const search = await this.search(params);
        const betterSearch:SearchResult<GameInstanceSummary> = {
            count:search.count,
            page:search.page,
            pages:search.pages,
            results:search.results.map( result => ({
                gameId:result.gameId,
                size:result.size,
                gameName:gameMap[result.gameId]?.media.name || 'undefined',
                id:result.id,
                numPlayers:result.players.length,
                liveData: livingInstanceStats[result.id] || undefined
            }))
        }

        return betterSearch;
    }

    /**
     * Aumenta o disminuye el nº de jugadores de una instancia
     * 
     * @param entity 
     */
    async updateNumPlayers(id:string,data:Record<string,any>): Promise<Partial<GameInstance>> {
        /**
         * 1.- No se puede actualizar una instancia en ejecución
         */
        const inMemory = getInstances().find( instance => instance.id == id)
        if(inMemory) throw <ServiceError>{code:ServiceErrorCode.Conflict, message:'No se puede modificar una instancia en ejecución' }

        const prev = await this.load(id);
        const numPlayers = prev.players.length;
        /**
         * 2.- Validar la entrada, se espera el nº de jugadores
         */
        const maxPlayers = +data['maxPlayers'];
        if(isNaN(maxPlayers)){
            throw <ServiceError>{code:ServiceErrorCode.BadRequest, message:'Se necesita el número de jugadores' }
        }
        /**
         * 2.- No se puede reducir el nº de plazas de una instancia por debajo de su número
         * actual de jugadores
         */
        if(numPlayers > maxPlayers){
            throw <ServiceError>{code:ServiceErrorCode.Conflict, message:'No se puede reducir el número de usuarios por debajo del número de jugadores activos' }
        }

        prev.maxPlayers = data['maxPlayers'];

        const updated = await this.update(prev);
        return reduceInstance(updated);
    }

    async changeStatus(id:string,request:Record<string,string>): Promise<string> {
        const status = request['status'];
        const inMemory = getInstances().find( instance => instance.id == id)
        if(!status) throw <ServiceError>{code:ServiceErrorCode.BadRequest, message:'No se ha facilitado el estado' };
        if(inMemory && status == START) throw <ServiceError>{code:ServiceErrorCode.Conflict, message:'la instancia ya estaba arrancada' }
        if(!inMemory && status == STOP)  throw <ServiceError>{code:ServiceErrorCode.Conflict, message:'la instancia no se encontraba en memoria' }

        // Todo verificado, a operar
        if(inMemory){
            //
            const instance = removeInstance(id);
            this.update(instance);
            console.log('Se ha guardado el estado de la instancia',id,'tras la parada');
        }else{
            // cargar
            const instance = await this.load(id);
            const game = await this.gameStore.load(instance.gameId);
            addInstance(instance,game);
        }

        return id;
    }

}