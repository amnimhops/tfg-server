export interface Query<T>{
    
}
export interface SearchResult<T>{
    count:number;
    page:number;
    pages:number;
    getResuls:T[];
}
export interface CRUDService<T,K>{
    save(instance:T):T;
    delete(id:K):boolean;
    search(query:Query<T>):SearchResult<T>;
}