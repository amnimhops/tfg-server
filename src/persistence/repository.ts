import { Db, Collection, MongoClient, ObjectId } from 'mongodb';


export interface SearchResult<T>{
    count:number;
    page:number;
    pages:number;
    results:T[];
}
type Pagination = {
    page:number;
    itemsPerPage:number;
}
type Sorting = {
    field:string;
    dir:'asc'|'desc';
}
export type Unique = {
    id?:string;
}

export interface ConnectionConfig{
    host:string,
    database:string,
    user?:string,
    password?:string,
    extra?:string
}

export interface ObjectFactory<T>{
    (instance:any):T
}


export class Repository<T extends Unique>{
    constructor(private collection: Collection) { }

    async load(id: string): Promise<T> {
        try{
            const result = await this.collection.findOne({
                "_id": new ObjectId(id)
            });
            console.log(result);
            return { id: result._id.toHexString(), ...result } as any;
        }catch(error){
            console.error('Error loading object',id,'from collection',this.collection.collectionName);
        }
        
    }

    async save(object: T): Promise<string> {
        try{
            if (object.id) {
                await this.collection.updateOne(
                    { "_id": new ObjectId(object.id) },
                    object,
                    { upsert: false, writeConcern: { w: 1 } }
                );
    
                return object.id;
            } else {
                const response = await this.collection.insertOne(object, { writeConcern: { w: 1 } });
                return response.insertedId.toHexString();
            }
        }catch(error){
            console.error('Error saving object',error);
            throw error;
        }
        
    }

    find(query: any): Promise<T[]> {
        throw new Error('Method not implemented.');
    }

    search(query:any, pagination:Pagination):Promise<SearchResult<T>>{
        return null;
    }

    delete(id: string): Promise<T> {
        throw new Error('Method not implemented.');
    }


}

export class Connection {
    client: MongoClient;
    db: Db;
    async connect(settings: ConnectionConfig): Promise<any> {
        this.client = new MongoClient(`mongodb://${settings.host}`, {
            auth: {
                username: settings.user,
                password: settings.password
            }
        });

        return this.client.connect().then(() => {
            this.db = this.client.db(settings.database);
            return true;
        }).catch(err => {
            console.error('Connection error',err);
            throw err;
        })
    }

    createRepository<T extends Unique>(table: string): Repository<T> {
        const collection = this.db.collection(table);
        return new Repository<T>(collection);
    }

}
