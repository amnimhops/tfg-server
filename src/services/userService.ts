
import { Collections, Connection, Repository } from "../persistence/repository";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { BasicRESTService, IRestService } from "./restService";
import { LoginRequest, PasswordRecoveryRequest, SearchParams, User, WithToken } from '../models/monolyth';
import * as crypto from 'crypto';
import { setSession } from "../live/sessions";
import { uuid } from "uuidv4";

const DEFAULT_USER_AVATAR = process.env.CDN_URL+'default/portrait-default.svg';

function securePass(pass:string):string{
    return crypto.createHash('md5').update(pass).digest('hex')
}
export interface IUserService extends IRestService<User>{
    authenticate(request:LoginRequest):Promise<WithToken<User>>;
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

    async validateUser(user:User):Promise<Record<string,string>>{
        const errors : Record<string,string> = {};

        if(!user.email) {
            errors['email'] = 'Debe indicar el email';
        }else{
            const others = await this.find({email:user.email});
            if(others.length > 0) { // En realidad, solo podría haber uno
                errors['email'] = 'El correo ya está registrado';
            }
        }
        if(!user.nickname){
            errors['nickname'] = 'Indica un nombre de jugador';
        }else{
            const others = await this.find({nickname:user.nickname});
            if(others.length > 0){
                errors['nickname'] = 'Este nombre ya existe';
            }
        }
        if(!user.name) errors['name'] = 'Indica tu nombre';
        if(!user.surname) errors['surname'] = 'Indica tu apellido';

        return errors;
        
    }

    async authenticate(request:LoginRequest):Promise<WithToken<User>>{
        const email = request.email;
        const password = securePass(request.password);
        const users = await this.repository.find({email,password});

        if(users.length == 1){
            const user = users[0];
            const hash = crypto.createHash('md5').update(user.email+"-"+Date.now()).digest('hex');
            
            setSession(hash,user);

            return {
                ...user,
                token:hash
            };
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

    async create(entity: User): Promise<User> {
        await this.checkEmailIsNotInUse(entity);
        // No guardar el pass en plano
        entity.password = securePass(entity.password);
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

    async setImage(id:string,url:string|null):Promise<void>{
        const user = await this.load(id);
        if(url == null){
            // Imagen por defecto, esto no es a nivel de juego sino de plataforma
            url = DEFAULT_USER_AVATAR;
        }
        user.portrait = { id:'default-user-avatar',type:'image',url }; // No hace falta crear un ID unico, es mas, interesa que se repita para eliminar duplicados
        await this.update(user);
    }
}