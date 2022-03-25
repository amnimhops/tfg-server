import { Connection, ConnectionConfig, ObjectFactory, Query, Repository, Unique } from '../interface';
import {Db,Collection, MongoClient, ObjectId} from 'mongodb';

class MongoRepository<T extends Unique> implements Repository<T>{
    constructor(private collection:Collection) {}

    async load(id: string): Promise<T> {
        const result = await this.collection.findOne({
            "_id":new ObjectId(id)
        });
        console.log(result);
        return {id:result._id.toHexString(),...result} as any;
    }

    async save(object: T): Promise<T> {
        if(object.id){
            await this.collection.updateOne(
                {"_id":new ObjectId(object.id)},
                object,
                {upsert:false,writeConcern:{w:1}}
            );

            return object;
        }else{
            const response = await this.collection.insertOne(object,{writeConcern:{w:1}});
            object.id = response.insertedId.toHexString();

            return object;
        }
    }

    find(query: Query<T>): Promise<T> {
        throw new Error('Method not implemented.');
    }

    delete(id: string): Promise<T> {
        throw new Error('Method not implemented.');
    }

}

export class MongoConnection implements Connection{
    client:MongoClient;
    db:Db;
    async connect(settings:ConnectionConfig): Promise<any> {
        this.client = new MongoClient(`mongodb://${settings.host}`,{
            auth:{
                username:settings.user,
                password:settings.password
            }
        });
        
        return this.client.connect().then( () => {
            this.db = this.client.db(settings.database);
            return true;
        });
    }
   
    createRepository<T extends Unique>(table:string):Repository<T>{
        const collection = this.db.collection(table);
        return new MongoRepository<T>(collection);
    }

}
