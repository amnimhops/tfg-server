import { Connection, Repository, Unique } from "../persistence/repository";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { SearchParams } from "../models/monolyth";
import { SearchResult } from "../models/monolyth";

export interface IRestService<Type extends Unique>{
    load(id: string):Promise<Type>;
    find(data: Record<string, any>): Promise<Type[]>;
    create(entity: Type): Promise<Type>;
    update(entity: Type): Promise<Type>;
    delete(id: string): Promise<void>;
}

export class BasicRESTService<Type extends Unique> implements IRestService<Type>{
    private _repository:Repository<Type>;
    constructor(connection:Connection, collection:string){
        this._repository = connection.createRepository<Type>(collection);
    }
    protected get repository():Repository<Type> {
        return this._repository;
    }
    async load(id: string): Promise<Type> {
        const record = await this._repository.load(id);
        if(!record){
            throw <ServiceError>{code:ServiceErrorCode.NotFound,message:`Identificador ${id} no encontrado`};
        }

        return record;
    }
    async find(data: Record<string, any>,fields?:Record<string,any>): Promise<Type[]> {
        const projection = fields || {};
        const records = await this._repository.find(data,projection);
        console.log(records.length,'registros encontrados');
        return records;
    }
    async search(params:SearchParams):Promise<SearchResult<Type>>{
        return await this.repository.search(params);
    }
    async create(entity: Type): Promise<Type> {
        const exists = await this._repository.load(entity.id);
        if(exists) throw <ServiceError> {
            code:ServiceErrorCode.Conflict,
            message:`Ya existe una entidad con el identificador ${entity.id}`
        }

        try{
            const id = await this._repository.save(entity);
            console.log('Entidad registrada con el identificador',id);
    
            return entity;
        }catch(error){
            throw <ServiceError> {code:ServiceErrorCode.ServerError,message:error?.message}
        }
        
    }
    async update(entity: Type): Promise<Type> {
         await this.load(entity.id); // Lanzará un error en caso de no encontrar el id
         const savedId = await this._repository.save(entity);
         console.log('Entidad con id',savedId,'actualizada');
         return entity;
    }
    async delete(id: string): Promise<void> {
        await this.load(id);
        await this._repository.delete(id);
    }
}