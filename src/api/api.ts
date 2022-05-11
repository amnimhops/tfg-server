import { Router,Request,Response } from "express";
import { ActivityTarget, ActivityType, Asset, CellInstance, EnqueuedActivity, Game, InstancePlayer, Message, SearchResult, TradingAgreement, User, Vector, WorldMapQuery, WorldMapSector } from "../models/monolyth";

import { Connection } from "../persistence/repository";
import { IInstanceService, InstanceService } from "../services/instanceService";
import { ServiceError } from "../models/errors";
import { IUserService, LoginRequest, PasswordRecoveryRequest, UserService } from "../services/userService";
import { GameplayService } from "../services/gameplayService";
import { GameService } from "../services/gameService";


function handleRequest<Output>( task:Promise<Output>, response:Response<Output|string>):void {
    task.then( (result:Output) => {
        response.send(result);
    }).catch( (error:ServiceError) => {
        console.log(error);
        response.status(error.code).send(error.message);
    });
}

// NOTA, recuerda avisar del asunto del CORS (npm install cors)
function setupRouter(
    users:UserService,
    instances:InstanceService,
    gameplay:GameplayService,
    games:GameService):Router{

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
    router.post('/sessions/login',(request:Request<{},string,LoginRequest>,response:Response<string>) =>{
        handleRequest(users.authenticate(request.body),response);
    });
    router.get('/games',(request:Request<{},Partial<Game[]>,{}>,response:Response<Partial<Game[]>>) =>{
        handleRequest(games.getGameList(),response);
    });
    router.post('/games/:id/join',(request:Request<{id:string},Asset[]>,response:Response<Asset[]>) =>{
        handleRequest(gameplay.joinGame(request.headers.authorization,request.params.id),response);
    });
    router.get('/instance/gamedata',(request:Request<{id:string},Game>,response:Response<Game>) =>{
        handleRequest(gameplay.getGameData(request.headers.authorization),response);
    });
    // Métodos de juego de la api
    // Self e :id hacen lo mismo, self se calza antes para que no se ejecute :id con id = self 
    router.get('/instance/players/self',(request:Request<{},Partial<InstancePlayer>,{}>,response:Response<Partial<InstancePlayer>>) =>{
        handleRequest(gameplay.getInstancePlayer(request.headers.authorization),response);
    });
    router.get('/instance/players/:id',(request:Request<{id:string},Partial<InstancePlayer>,{}>,response:Response<Partial<InstancePlayer>>) =>{
        handleRequest(gameplay.getInstancePlayer(request.headers.authorization,request.params.id),response);
    });
    
    router.get('/instance/cells',(request:Request<{},CellInstance[]>,response:Response<CellInstance[]>) =>{
        handleRequest(gameplay.getCells(request.headers.authorization),response);
    });

    router.get('/instance/messages',(request:Request<{},SearchResult<Message>,{text:string,type:number,page:number} >,response:Response<SearchResult<Message>>) =>{
        const [text,type,page] = [request.query.text as string,parseInt(request.query.type as string),parseInt(request.query.page as string)];
        handleRequest(gameplay.getMessages(request.headers.authorization,text,type,page),response);
    });
    router.post('/instance/messages',(request:Request<{},string,{dstPlayerId:string,subject:string,message:string}>,response:Response<string>) =>{
        handleRequest(gameplay.sendMessage(request.headers.authorization,request.body.dstPlayerId,request.body.subject,request.body.message),response);
    });
    router.delete('/instance/messages/:id',(request:Request<{id:number}>, response:Response<string>) => {
        handleRequest(gameplay.deleteMessage(request.headers.authorization,request.params.id),response)
    });
    router.post('/instance/queue',(request:Request<{},EnqueuedActivity,{type:ActivityType,target:ActivityTarget}>,response:Response<EnqueuedActivity>) =>{
        handleRequest(gameplay.startActivity(request.headers.authorization,request.body.type,request.body.target),response);
    });
    router.get('/instance/queue',(request:Request<{},EnqueuedActivity[],{},{type:ActivityType}>,response:Response<EnqueuedActivity[]>) =>{
        handleRequest(gameplay.getQueue(request.headers.authorization,request.query.type),response);
    });
    /* Post es para agregar y put para sustituir, y el orden ni siquiera es parte de una actividad. Este verbo me ha parecido el más adecuado */
    router.patch('/instance/queue/:id',(request:Request<{id:number},void,{offset:number}>,response:Response<void>) =>{
        handleRequest(gameplay.changeActivityOrder(request.headers.authorization,request.params.id,request.body.offset),response);
    });
    router.delete('/instance/queue/:id',(request:Request<{id:number},void,{}>,response:Response<void>) =>{
        handleRequest(gameplay.cancelActivity(request.headers.authorization,request.params.id),response);
    });
    router.get('/instance/map',(request:Request<{},WorldMapSector,{},string>,response:Response<WorldMapSector>) =>{
        const q = request.query['sector'].split(',').map(s => parseInt(s));
        const query = {p1:new Vector(q[0],q[1]),p2:new Vector(q[2],q[3])} as WorldMapQuery;
        handleRequest(gameplay.getWorldMap(request.headers.authorization,query),response);
    });
    router.post('/instance/trades',(request:Request<{},string,TradingAgreement>,response:Response<string>) =>{
        handleRequest(gameplay.sendTradeAgreement(request.headers.authorization,request.body),response);
    });
    
    router.delete('/instance/trades/:id',(request:Request<{id:number}>, response:Response<void>) => {
        handleRequest(gameplay.cancelTradeAgreement(request.headers.authorization,request.params.id),response)
    });

    router.patch('/instance/trades/:id',(request:Request<{id:number}>, response:Response<void>) => {
        handleRequest(gameplay.acceptTradeAgreement(request.headers.authorization,request.params.id),response)
    });

    router.get('/instance/trades/:id',(request:Request<{id:number}>, response:Response<TradingAgreement>) => {
        handleRequest(gameplay.getTradingAgreement(request.headers.authorization,request.params.id),response)
    });


    console.info('Definición de rutas completada');
    return router;
}

export interface GameAPI{
    userService:IUserService;
    instanceService:IInstanceService;
    router:Router
}

export function createAPI(connection:Connection):GameAPI{
    const userService = new UserService(connection);
    const instanceService = new InstanceService(connection);
    const gameplayService = new GameplayService(connection);
    const gameService = new GameService(connection);
    const router = setupRouter(
        userService,
        instanceService,
        gameplayService,
        gameService
    );
    
    const api : GameAPI = {
        userService,
        instanceService,
        router
    }

    console.log('Api iniciada')
    return api;
}