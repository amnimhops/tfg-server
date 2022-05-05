import { Collections, Connection, Repository } from "../persistence/repository";
import { Game, GameInstance, Player } from "../models/monolyth";
import { addInstance } from "../live/instances";


export class InstanceService{
    private instanceStore:Repository<GameInstance>;
    private gameStore:Repository<Game>;
    private playerStore:Repository<Player>;

    constructor(connection:Connection){
        this.gameStore = connection.createRepository<Game>(Collections.Games);
        this.instanceStore = connection.createRepository<GameInstance>(Collections.GameInstances);
        this.playerStore = connection.createRepository<Player>(Collections.Players);

        console.info('Servicio de instancias iniciado')
    }

    async save(instance: GameInstance): Promise<string> {
        const id = await this.instanceStore.save(instance);
        if(instance.id == undefined){
            instance.id = id;
        }

        return instance.id;
    }

    async startInstances():Promise<void>{
        const instances = await this.instanceStore.find({});
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