export interface Unique{
    id?:string;
    [key:string]:any;
}
export interface Query<T>{
    
}
export interface ConnectionConfig{
    host:string,
    database:string,
    user?:string,
    password?:string,
    extra?:string
}
export interface Connection{
    connect(settings:ConnectionConfig):Promise<any>;
    createRepository<T extends Unique>(table:string,factory:ObjectFactory<T>):Repository<T>;
}

export interface ObjectFactory<T>{
    (instance:any):T
}
export interface Repository<T extends Unique>{
    load(id:string):Promise<T>;
    save(object:T):Promise<T>;
    find(query:Query<T>):Promise<T>;
    delete(id:string):Promise<T>;
}