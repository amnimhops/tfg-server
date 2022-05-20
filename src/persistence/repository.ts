import { Db, Collection, MongoClient, ObjectId, Filter } from 'mongodb';
import { SearchParams } from '../models/monolyth';
import { SearchResult } from '../models/monolyth';

export type Unique = {
    id?:string;
}

export interface ObjectFactory<T>{
    (instance:any):T
}


export class Repository<T extends Unique>{
    constructor(private collection: Collection) { }

    async load(id: string, fields?:Record<string,any>): Promise<T> {
        try{
            const projection = fields || {};
            const result = await this.collection.findOne({"id": id},{projection}); // No confundir con _id
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
        const data = await this.collection.find(query,{projection}).toArray()
        // Se eliminan los identificadores para impedir actualizaciones futuras
        return data.map( element => {
            delete element['_id'];
            return element as any;
        });
    }

    async search(params:SearchParams):Promise<SearchResult<T>>{
        const recordsPerPage = params.records || 50;
        const page = params.page || 1;
        /**
         * Las páginas tienen base 1, pero el nº de registros a saltar tiene base 0
         */
        const skip = recordsPerPage * Math.max(0,page-1);
        const limit = recordsPerPage;
        const count = await this.collection.countDocuments(params.criteria); 
        const dir = params.sortOrder !== undefined ?params.sortOrder : 1;
        const projection = params.fields || {}
        const data = await this.collection
            .find(params.criteria,{projection})
            .sort(params.sortField||'id',dir)
            .skip(skip)
            .limit(limit)
            .toArray();
        
        return {
            count:(+count),
            page:params.page,
            pages:Math.ceil( (+count) / recordsPerPage),
            results:data.map( element => {
                delete element['_id'];
                return element as any;
            }) as any
        };
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
    
    async connect(): Promise<void> {
        const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost'
        this.client = new MongoClient(connectionString)
        /*this.client = new MongoClient(`mongodb://${settings.host}`, {
            auth: {
                username: settings.user,
                password: settings.password
            }
        });*/

        return this.client.connect().then(() => {
            this.db = this.client.db(process.env.DATABASE || 'fu');
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