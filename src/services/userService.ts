
import { Collections, Connection, Repository } from "../persistence/repository";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { BasicRESTService, IRestService } from "./restService";
import { User } from '../models/monolyth';
import * as crypto from 'crypto';
import { setSession } from "../live/sessions";

export interface PasswordRecoveryRequest{
    id?:string; // Unique, actuará como token
    email:string;
    requestDate:Date;
}

export interface LoginRequest{
    email:string;
    password:string;
}
export interface IUserService extends IRestService<User>{
    authenticate(request:LoginRequest):Promise<string>;
    checkEmailIsNotInUse(user:User):Promise<void>;
    requestPasswordChange(email:string):Promise<PasswordRecoveryRequest>;
}
export class UserService extends BasicRESTService<User> implements IUserService{
    private passwordTokenRepo:Repository<PasswordRecoveryRequest>;
    constructor(connection:Connection){
        super(connection,Collections.Users)
        this.passwordTokenRepo = connection.createRepository<PasswordRecoveryRequest>("passwordRecoveryRequests");

        console.info('Servicio de usuarios iniciado')
    }

    async authenticate(request:LoginRequest):Promise<string>{
        const users = await this.repository.find({...request});

        if(users.length == 1){
            const user = users[0];
            const hash = crypto.createHash('md5').update(user.email+"-"+Date.now()).digest('hex');
            
            setSession(hash,user);

            return hash;
        }else{
            throw <ServiceError>{code:ServiceErrorCode.Unauthorized,message:'Las credenciales no son válidas'};
        }
    }
   
    async checkEmailIsNotInUse(user:User):Promise<void>{
        const emailExists = await this.repository.find({email:user.email});
        
        if(emailExists.length > 0){
            throw <ServiceError>{code:ServiceErrorCode.Conflict,message:'Ya existe un usuario con este email'};
        }
    }

    async create(entity: User): Promise<string> {
        await this.checkEmailIsNotInUse(entity);
        return await super.create(entity);
    }
    
    async requestPasswordChange(email:string):Promise<PasswordRecoveryRequest>{
        const previousTokens = await this.passwordTokenRepo.find({email});
        if(previousTokens.length > 0) {
            throw <ServiceError>{code:ServiceErrorCode.Conflict,message:'Ya existe una solicitud para este email'};
        }

        const request:PasswordRecoveryRequest = {email,requestDate:new Date()};
        const id = await this.passwordTokenRepo.save(request);
        console.log('Creado token de recuperación con id',id);

        return request;
    }
}