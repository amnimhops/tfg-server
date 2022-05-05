import { Db, Collection, MongoClient, ObjectId } from 'mongodb';

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
            const result = await this.collection.findOne({"id": id}); // No confundir con _id
            delete result['_id']; // Ocultamos el identificador interno de mongo, así los updates no generarán inconsistencias
            return result as any;
        }catch(error){
            console.error('Error loading object',id,'from collection',this.collection.collectionName);
        }
        
    }

    async save(object: T): Promise<string> {
        /**
         * Aunque _id es importante para replicación, no lo usaremos
         * como identificador de los documentos. Esto se debe a que
         * _id es un objeto, y el modelo de datos necesita referenciarse
         * usando strings. Así pues, se crea un nuevo campo 'id' con 
         * el contenido string de un nuevo ObjectId(), que se usará
         * como clave de búsqueda.
         */
        try{
            // Esto evita que alguien intente sobreescribir el identificador interno de mongo
            if(object['_id']) delete object['_id'];

            if(!object.id){
                object.id = new ObjectId().toHexString();
            }
            await this.collection.replaceOne(
                { "id": object.id}, // No confundir con _id
                object,
                { upsert: true, writeConcern: { w: 1 } }
            );

            return object.id;
        }catch(error){
            console.error('Error saving object',error);
            throw error;
        }
        
    }

    async find(query: any, projection?:{[name:string]:boolean}): Promise<T[]> {
        const data = await this.collection.find(query,projection).toArray()
        // Se eliminan los identificadores para impedir actualizaciones futuras
        return data.map( element => {
            delete element['_id'];
            return element as any;
        });
    }

    async delete(id: string): Promise<void> {
        const result = await this.collection.deleteOne({id});
        console.log('Deleted',result.deletedCount,'documents from',this.collection.collectionName);
    }
}

export class Connection {
    private client: MongoClient;
    private db: Db;
    private collections:Record<string,Collection> = {};
    
    async connect(settings: ConnectionConfig): Promise<void> {
        this.client = new MongoClient(`mongodb://${settings.host}`, {
            auth: {
                username: settings.user,
                password: settings.password
            }
        });

        return this.client.connect().then(() => {
            this.db = this.client.db(settings.database);
        }).catch(err => {
            console.error('Connection error',err);
            throw err;
        })
    }

    createRepository<T extends Unique>(table: string): Repository<T> {
        /**
         * Nota interesante: el driver crea 
         */
        if(this.collections[table] == undefined){
            this.collections[table] = this.db.collection(table);
        }

        return new Repository<T>(this.collections[table]);
    }

}


export enum Collections {
    Games = "games",
    GameInstances = "gameInstances",
    Players = "players",
    Users = "users"
}