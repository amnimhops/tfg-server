import { Collections, Connection, Repository } from "../persistence/repository";
import { Game, GameInstance, Player } from "../models/monolyth";
import { addInstance } from "../live/instances";
import { BasicRESTService, IRestService } from "./restService";

export interface IInstanceService extends IRestService<GameInstance>{
    startInstances():Promise<void>
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
}