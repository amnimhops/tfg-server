import { Game } from '../models/monolyth';
import { Collections, Connection, Repository } from '../persistence/repository';

export class GameService{
    private gameStore:Repository<Game>;

    constructor(private connection:Connection){
        this.gameStore = connection.createRepository<Game>(Collections.Worlds);
    }

    async getAvailableGames():Promise<Partial<Game>[]>{
        const found = await this.gameStore.find({},{fu:false});
        const descriptors:Partial<Game>[] = [];

        for(const descriptor of found){
            descriptors.push({
                id:descriptor.id,
                media:descriptor.media
            });
        }
        
        return descriptors;
    }

    async saveGame(game:Game):Promise<string>{
        const id = await this.gameStore.save(game);
        game.id = id;
        return id;
    }
}