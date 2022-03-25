import { CRUDService, Query, SearchResult } from ".";
import { GameInstance } from "../models/shared/instances";
import { Repository } from "../repositories";

export class InstanceService implements CRUDService<string,GameInstance>{
    constructor(private instanceRepository:Repository<GameInstance>){
        
    }
    save(instance: string): string {
        throw new Error("Method not implemented.");
    }
    delete(id: GameInstance): boolean {
        throw new Error("Method not implemented.");
    }
    search(query: Query<string>): SearchResult<string> {
        throw new Error("Method not implemented.");
    }
    
}