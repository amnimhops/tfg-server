
import { User } from "../../models/monolyth";
import { Connection, Repository } from "../../persistence/repository";
import { Collections } from "../../models/shared/_old/schema";
import { ServiceError, ServiceErrorCode } from "./dataTypes";
import { BasicRESTService } from "./restService";

export interface PasswordRecoveryRequest{
    id?:string; // Unique, actuará como token
    email:string;
    requestDate:Date;
}

export class UserService extends BasicRESTService<User>{
    private passwordTokenRepo:Repository<PasswordRecoveryRequest>;
    constructor(connection:Connection){
        super(connection,Collections.Users)
        this.passwordTokenRepo = connection.createRepository<PasswordRecoveryRequest>("passwordRecoveryRequests");

        console.info('Servicio de usuarios iniciado')
    }
   
    async checkEmailIsNotInUse(user:User):Promise<void>{
        const emailExists = await this.repository.find({email:user.email});
        
        if(emailExists.length > 0){
            throw <ServiceError>{code:ServiceErrorCode.Duplicated,message:'Ya existe un usuario con este email'};
        }
    }

    async create(entity: User): Promise<string> {
        await this.checkEmailIsNotInUse(entity);
        return await super.create(entity);
    }
    
    async requestPasswordChange(email:string):Promise<PasswordRecoveryRequest>{
        const previousTokens = await this.passwordTokenRepo.find({email});
        if(previousTokens.length > 0) {
            throw <ServiceError>{code:ServiceErrorCode.Duplicated,message:'Ya existe una solicitud para este email'};
        }

        const request:PasswordRecoveryRequest = {email,requestDate:new Date()};
        const id = await this.passwordTokenRepo.save(request);
        console.log('Creado token de recuperación con id',id);

        return request;
    }
}