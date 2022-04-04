import { Connection, Repository } from "../persistence/repository";
import { Collections, DBGameInstance, DBPlayer, DBWorldDescriptor } from "../models/shared/_old/schema";
import { GameInstance } from "../models/monolyth";


export class InstanceService {
    private instanceStore:Repository<GameInstance>;
    private gameStore:Repository<DBWorldDescriptor>;
    private playerStore:Repository<DBPlayer>;

    constructor(connection:Connection){
        this.gameStore = connection.createRepository<DBWorldDescriptor>(Collections.Worlds);
        this.instanceStore = connection.createRepository<GameInstance>(Collections.GameInstances);
        this.playerStore = connection.createRepository<DBPlayer>(Collections.Players);

        console.info('Servicio de instancias iniciado')
    }

    async save(instance: GameInstance): Promise<string> {
        const id = await this.instanceStore.save(instance);
        if(instance.id == undefined){
            instance.id = id;
        }

        return instance.id;
    }

    async load(id: string): Promise<GameInstance>{
        const instance = await this.instanceStore.load(id);
        const world = await this.gameStore.load(instance.gameId);
        const players = await this.playerStore.find(instance.players);

        return instance;
    }
}