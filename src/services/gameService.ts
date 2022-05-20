
import { Collections, Connection, Repository } from "../persistence/repository";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { BasicRESTService, IRestService } from "./restService";
import { Game, GameInstance, SearchParams, SearchResult, User } from '../models/monolyth';
import { getInstances } from "../live/instances";

export interface IGameService extends IRestService<Game>{
    getGameList():Promise<Partial<Game>[]>;
}

const basicGameFields = {id:1,media:1,ownerId:1,rating:1};

/**
 * Devuelve una versión con los metadatos de juego, sin el grueso de la información
 * @param game 
 * @returns 
 */
export function reduceGame(game:Game):Partial<Game>{
    const reduced = {};
    for(const k in basicGameFields) reduced[k] = game[k];
    return reduced;
}

export class GameService extends BasicRESTService<Game> implements IGameService {
    private instanceRepo:Repository<GameInstance>;
    constructor(connection:Connection){
        super(connection,Collections.Games)
        
        this.instanceRepo = connection.createRepository<GameInstance>(Collections.GameInstances);
        
        console.info('Servicio de juegos iniciado')
    }

    /**
     * Método que efectua una búsqueda con parámetros sobre la lista
     * de juegos pero devuelve solo los metadatos. Su propósito es 
     * minimizar el tiempo de carga, pues la información contenida
     * en cada juego puede ser de varios megabytes.
     * @param params 
     */
    async searchPartial(params:SearchParams):Promise<SearchResult<Partial<Game>>>{
        params.fields = basicGameFields;
        return await super.search(params);
    }
    /**
     * Devuelve una lista con la información parcial de los juegos disponibles
     * @returns Lista de juegos disponibles
     */
    async getGameList():Promise<Partial<Game>[]>{
        const games = await this.find({},basicGameFields);
        return games;
    }

    /**
     * Sobreescritura de delete() para aplicar las reglas de negocio
     * @param id 
     */
    async delete(id: string): Promise<void> {
        const inMemory = getInstances().find( instance => instance.id == id);

        if(inMemory) throw <ServiceError>{code:ServiceErrorCode.Conflict,message:"No se puede borrar un juego con instancias en ejecución"};
        
        const inDatabase = await this.instanceRepo.find({gameId:id},{id:true});
        if(inDatabase.length > 0) throw <ServiceError>{code:ServiceErrorCode.Conflict,message:"No se puede borrar un juego mientras disponga de instancias"};

        return super.delete(id);
    }
}