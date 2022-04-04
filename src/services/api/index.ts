import { Router,Request,Response } from "express";
import { User } from "../../models/monolyth";
import { Connection } from "../../persistence/repository";
import { InstanceService } from "../instanceService";
import { ServiceError } from "./dataTypes";
import { PasswordRecoveryRequest, UserService } from "./userService";

function handleRequest<Output>( task:Promise<Output>, response:Response<Output|string>):void {
    task.then( (result:Output) => {
        response.send(result);
    }).catch( (error:ServiceError) => {
        response.status(error.code).send(error.message);
    });
}


function setupRouter(users:UserService,instances:InstanceService):Router{
    const router = Router({strict:true});
    
    router.get(['/users','/users/'],(request:Request, response:Response<User[]|string>) => {
        handleRequest(users.find(request.query),response);
    });
    router.get('/users/:id',(request:Request<{id:string}>, response:Response<string>) => {
        handleRequest(users.load(request.params.id),response);
    });
    router.post('/users',(request:Request<{},any,User>, response:Response<string>) => {
        handleRequest(users.create(request.body),response);
    });
    router.put('/users/:id',(request:Request<{id:string},any,User>, response:Response<string>) => {
        // Los modelos empleados ya incorporan el ID
        handleRequest(users.update(request.body),response);
    });
    router.delete('/users/:id',(request:Request<{id:string}>, response:Response<void>) => {
        handleRequest(users.delete(request.params.id),response)
    });
    router.post(['/users/recoveryTokens'],(request:Request<{},PasswordRecoveryRequest,{email:string}>, response:Response<PasswordRecoveryRequest|string>) => {
        handleRequest(users.requestPasswordChange(request.body.email),response);
    });
    router.get('/instance/activities',(
        request:Request<{instanceId:string},PasswordRecoveryRequest,{email:string}>, 
        response:Response<PasswordRecoveryRequest|string>) => {
    })

    console.info('Definición de rutas completada');
    return router;
}

export interface GameAPI{
    userService:UserService;
    instanceService:InstanceService;
    router:Router
}

export function createAPI(connection:Connection):GameAPI{
    const userService = new UserService(connection);
    const instanceService = new InstanceService(connection);
    const router = setupRouter(userService,instanceService);
    
    const api : GameAPI = {
        userService,
        instanceService,
        router
    }

    console.log('Api iniciada')
    return api;
}