import { CRUDService, Query, SearchResult } from ".";
import { User } from "../models/server/users";

interface UserService extends CRUDService<User,string>{
    addPrivileges(userId:string,privileges:any);
    revokePrivileges(userId:string,privileges:any);
}
/*
class UserServiceImpl implements UserService{
    constructor(userRepository:Repository<User>)
    addPrivileges(userId: string, privileges: any) {
        throw new Error("Method not implemented.");
    }
    revokePrivileges(userId: string, privileges: any) {
        throw new Error("Method not implemented.");
    }
    save(instance: User): User {
        throw new Error("Method not implemented.");
    }
    delete(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    search(query: Query<User>): SearchResult<User> {
        throw new Error("Method not implemented.");
    }

}*/