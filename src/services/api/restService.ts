import { Connection, Repository, Unique } from "../../persistence/repository";
import { ServiceError, ServiceErrorCode } from "./dataTypes";


export class BasicRESTService<Type extends Unique>{
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
    async find(data: Record<string, any>): Promise<Type[]> {
        const records = await this._repository.find(data);
        console.log(records.length,'registros encontrados');
        return records;
    }
    async create(entity: Type): Promise<string> {
        const exists = await this._repository.load(entity.id);
        if(exists) throw <ServiceError> {
            code:ServiceErrorCode.Duplicated,
            message:`Ya existe una entidad con el identificador ${entity.id}`
        }

        try{
            const id = await this._repository.save(entity);
            console.log('Entidad registrada con el identificador',id);
    
            return id;
        }catch(error){
            throw <ServiceError> {code:ServiceErrorCode.ServerError,message:error?.message}
        }
        
    }
    async update(entity: Type): Promise<void> {
         await this.load(entity.id); // Lanzará un error en caso de no encontrar el id
         const savedId = await this._repository.save(entity);
         console.log('Entidad con id',savedId,'actualizada');
    }
    async delete(id: string): Promise<void> {
        await this.load(id);
        await this._repository.delete(id);
    }
}