
import { Collections, Connection, Repository } from "../persistence/repository";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { BasicRESTService, IRestService } from "./restService";
import { Game, User } from '../models/monolyth';

export interface IGameService extends IRestService<Game>{
    getGameList():Promise<Partial<Game>[]>;
}

export class GameService extends BasicRESTService<Game> implements IGameService {
    constructor(connection:Connection){
        super(connection,Collections.Games)
        console.info('Servicio de juegos iniciado')
    }

    /**
     * Devuelve una lista con la información parcial de los juegos disponibles
     * @returns Lista de juegos disponibles
     */
    async getGameList():Promise<Partial<Game>[]>{
        const games = await this.find({});
        return games.map( game => ({
            id:game.id,
            media:game.media
        }));
    }
}