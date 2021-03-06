import { Router,Request,Response } from "express";
import { ActivityTarget, ActivityType, Asset, CellInstance, EnqueuedActivity, FileUpload, Game, GameInstance, GameInstanceSummary, GameStats, InstancePlayer, InstancePlayerInfo, LoginRequest, Message, PasswordRecoveryRequest, Privilege, Privileges, RegistrationRequest, SearchResult, TradingAgreement, User, Vector, WithToken, WorldMapQuery, WorldMapSector } from "../models/monolyth";

import { Connection } from "../persistence/repository";
import { IInstanceService, InstanceService, reduceInstance } from "../services/instanceService";
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { IUserService, UserService } from "../services/userService";
import { GameplayService } from "../services/gameplayService";
import { UploadService } from "../services/uploadService";
import { GameService, reduceGame } from "../services/gameService";
import { Base64 } from "js-base64";
import { bigBounce, createSuperuser } from "./initialData";
import { ActivityCost } from "../models/activities";
import { getLoggedUser } from "../live/sessions";


/**
 * En cumplimiento de los estándares REST las búsquedas
 * han de hacerse mediante una solicitud GET. Esto presenta
 * el inconveniente de que, al enviar los parámetros por la
 * url, no podemos emplear objetos complejos. Para solucionar
 * este bache, todas las búsquedas serán suministradas como
 * cadenas de texto en base64, cuyo contenido será el JSON con
 * los argumentos de búsqueda.
 * que podemos e
 */
interface B64Search{
    q:string;
}


function handleRequest<Output>( task:Promise<Output>, response:Response<Output|string>):void {
    task.then( (result:Output) => {
        response.send(result);
    }).catch( (error:ServiceError) => {
        console.log(error);
        response.status(error.code).send(error.message);
    });
}
/**
 * TODO Hay un problema al convertir a base64 caracteres multibyte (la ñ, por ejemplo)
 * y las busquedas no se efectuan correctamente.
 * Info del problema en https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
 * 
 * Corregido con una librería de transcripción de base64
 * https://www.npmjs.com/package/js-base64
 */

function unwrapB64Json<T>(b64str:string):T{
    //const object = JSON.parse(Buffer.from(b64str,'base64').toString());
    const object = JSON.parse(Base64.decode(b64str));
    return object;
}


/**
 * Esta función termina la solicitud enviando el código de error
 * adecuado si determina que el usuario autenticado no dispone
 * de los permisos adecuados para continuar
 * @param auth token de autenticación
 * @param privileges un array de cadenas de texto cuyo
 * contenido se cotejará contra los privilegios del usuario
 * asociado al token.
 * @param matchAll determina si para conceder autorización
 * el usuario basta con que tenga uno de los permisos indicados
 * o todos ellos. Por defecto basta con tener uno.
 */
 function requestAuthorization(token:string,response:Response,privileges:Privilege[],matchAll:boolean=false){
    let status = false;
    if(!token){
        response.status(ServiceErrorCode.Unauthorized).send("No se ha suministrado el token");
    }else{
        
        try{
            const user = getLoggedUser(token)!;
            const sessionPrivileges = user.privileges || [];
            
            let count = 0;
        
            for(const privilege of privileges){
                if(sessionPrivileges.includes(privilege.id)){
                    count++;
                }
            }
        
            if(matchAll && count != privileges.length){
                response.status(ServiceErrorCode.Forbidden).send("No tiene permisos para ejecutar esta operación en este recurso");
            }else if( count == 0){
                response.status(ServiceErrorCode.Forbidden).send("No tiene permisos para ejecutar esta operación en este recurso");
            }else{
                status = true;
            }
        }catch(err){
            response.status(ServiceErrorCode.Forbidden).send("El token no es válido, cierra la sesión y vuelve a entrar.");
        }
        
    }

    if(status == false){
        /**
         * Parche del que no me siento muy orgulloso: lanzamos
         * una excepción para que express deje de procesar la
         * solicitud y no haya que editar a mano cada endpoint
         * controlando el retorno de este metodo.
         */
        throw new Error('Not authorized');
    }
}
// NOTA, recuerda avisar del asunto del CORS (npm install cors)
function setupRouter(
    users:UserService,
    instances:InstanceService,
    gameplay:GameplayService,
    games:GameService,
    uploads:UploadService,
    resetHandler:()=>Promise<any>):Router{

    const router = Router({strict:true});
    
    /*
     * Reseteo del servidor
     */
    router.get("/management/install",(request,response)=>{
        handleRequest(resetHandler(),response);
    });
    /*
     * Estado del servicio
     */
    router.get(['/ping'],(request,response) => response.status(200).send("PONG") );

    router.get(['/users','/users/'],(request:Request<{},{},SearchResult<User>,B64Search>, response:Response<SearchResult<User>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.ListUsers]);
        handleRequest(users.search(unwrapB64Json(request.query.q)),response);
    });
    
    router.get('/users/:id',(request:Request<{id:string}>, response:Response<User>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.ViewUser]);
        handleRequest(users.load(request.params.id),response);
    });
    router.get('/users/:id/games',(request:Request<{id:string}>, response:Response<InstancePlayerInfo[]>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.Play]);
        handleRequest(gameplay.userInstanceInfo(request.headers.authorization,request.params.id),response);
    });
    /* Validación de formulario de usuario */
    router.post('/users/check',(request:Request<{},any,User>, response:Response<Record<string,string>>) => {
        handleRequest(users.validateUser(request.body),response);
    });
    /**
     * Registro de usuario
     * 1.- Crea
     * 2.- Sube imagen
     * 3.- Autentifica
     */
    router.post('/users/register',(request:Request<{},WithToken<User>,RegistrationRequest>, response:Response<WithToken<User>>) => {
        const task = async (rq:RegistrationRequest) => {
            const plainPassword = rq.user.password; // Hay un users.create() modifica el password plano, y authenticate() lo necesita
            const user = await users.newPlayer(rq.user);
            let imageUrl : string|null = null;

            if(rq.avatar != null){
                imageUrl = await uploads.save(rq.avatar);
            }

            await users.setImage(user.id,imageUrl);  

            return await users.authenticate({
                email:rq.user.email,
                password:plainPassword
            });
        }
        handleRequest( task(request.body) ,response);
    });
    /* Creación de usuario */
    router.post('/users',(request:Request<{},any,User>, response:Response<User>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.AddUser]);
        handleRequest(users.create(request.body),response);
    });
    router.put('/users/:id',(request:Request<{id:string},any,User>, response:Response<User>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.EditUser]);
        // Los modelos empleados ya incorporan el ID
        handleRequest(users.update(request.body),response);
    });
    router.delete('/users/:id',(request:Request<{id:string}>, response:Response<void>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.DeleteUser]);
        handleRequest(users.delete(request.params.id),response)
    });
    router.post(['/users/recoveryTokens'],(request:Request<{},PasswordRecoveryRequest,{email:string}>, response:Response<PasswordRecoveryRequest|string>) => {
        handleRequest(users.requestPasswordChange(request.body.email),response);
    });
    
    router.post('/sessions/login',(request:Request<{},WithToken<User>,LoginRequest>,response:Response<WithToken<User>>) =>{
        handleRequest(users.authenticate(request.body),response);
    });
    router.delete('/sessions/',(request:Request<{},void>,response:Response<void>) =>{
        handleRequest(users.logout(request.headers.authorization),response);
    });
    // Este endpoint aunque parecido al de búsqueda de juegos, solo devuelve un listado
    router.get('/gamelist',(request:Request<{},Partial<Game[]>,{}>,response:Response<Partial<Game[]>>) =>{
        handleRequest(games.getGameList(),response);
    });
    // Búsqueda de juegos, pero de info. parcial ojo!
    router.get(['/games','/games/'],(request:Request<{},{},SearchResult<Partial<Game>>,B64Search>,response:Response<SearchResult<Partial<Game>>>) =>{
        handleRequest(games.searchPartial(unwrapB64Json(request.query.q)),response);
    });
    /* Esto devuelve el juego al completo, es una solicitud tocha */
    router.get('/games/:id',(request:Request<{id:string}>, response:Response<Game>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.ViewGame]);
        handleRequest(games.load(request.params.id),response);
    });
    /* Devuelve metainformación sobre el juego */
    router.get('/games/:id/stats',(request:Request<{id:string}>, response:Response<GameStats>) => {
        handleRequest(games.gameInfo(request.params.id),response);
    });
    /**
     * Reglas de estilo del juego. Si, aunque no lo parezca, es un endpoint de la API. Cuando una
     * instancia es arrancada, inyecta en su lista de assets una referencia a esta URL. El cliente
     * la recibe junto al resto de recursos gráficos al invocar el endpoint /join y la carga en memoria.
     * Aquí lo que hacemos es decirle al servicio de juegos que transforme la configuración de la
     * interfaz del juego en código CSS.
     */
    router.get('/games/:id/style.css',(request:Request<{id:string}>, response:Response<string>) => {
        //handleRequest(games.getGameStylesheet(request.params.id),response);
        games.getGameStylesheet(request.params.id).then( css => {
            response.setHeader('content-type', 'text/css');
            response.status(200).send(css);
        })
    });

    /* Creación de nuevo juego */
    router.post('/games',(request:Request<{},Partial<Game>,Game>,response:Response<Partial<Game>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.AddGame]);
        // Hacemos un pequeño apaño para no devolver de nuevo TODO el juego como 
        // respuesta al post
        handleRequest(games.create(request.body).then( (game) => reduceGame(game)),response);
    });
    router.put('/games/:id',(request:Request<{id:string},Partial<Game>,Game>, response:Response<Partial<Game>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.EditGame]);
        // Los modelos empleados ya incorporan el ID
        handleRequest(games.update(request.body).then( reduceGame ),response);
    });
    // La información de la instancia no está diseñada para ser transmitida. En su lugar,
    // para esta solicitud se devolverá un GameInstanceSummary con datos relevantes sobre el elemento.
    router.get(['/instances','/instances/'],(request:Request<{},{},SearchResult<GameInstanceSummary>,B64Search>,response:Response<SearchResult<GameInstanceSummary>>) =>{
        requestAuthorization(request.headers.authorization,response,[Privileges.ListInstances]);
        handleRequest(instances.searchSummaries(unwrapB64Json(request.query.q)),response);
    });

    router.get('/instances/:id',(request:Request<{id:string}>, response:Response<Partial<GameInstance>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.ViewInstances]);
        handleRequest(instances.load(request.params.id).then( reduceInstance ),response);
    });
    
    router.post('/instances',(request:Request<{},Partial<GameInstance>,GameInstance>,response:Response<Partial<GameInstance>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.AddInstance]);
        handleRequest(instances.create(request.body).then( (instance) => reduceInstance(instance)),response);
    });
    /**
     * en una instancia  solo se pueden hacer cambios parciales (maximo de jugadores)
     */
    router.patch('/instances/:id',(request:Request<{id:string},Partial<GameInstance>,GameInstance>,response:Response<Partial<GameInstance>>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.EditInstance]);
        handleRequest(instances.updateNumPlayers(request.params.id,request.body),response);
    });
    /**
     * Actualización del estado de ejecución de una instancia
     */
    router.put('/instances/:id/status',(request:Request<{id:string},string>,response:Response<string>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.EditInstance]);
        handleRequest(instances.changeStatus(request.params.id,request.body),response);
    });
    router.delete('/instances/:id',(request:Request<{id:string}>, response:Response<void>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.DeleteInstances]);
        handleRequest(instances.delete(request.params.id),response)
    });
    /*
     * no hay patch de juegos
     */

    router.delete('/games/:id',(request:Request<{id:string}>, response:Response<void>) => {
        requestAuthorization(request.headers.authorization,response,[Privileges.DeleteGame]);
        handleRequest(games.delete(request.params.id),response)
    });
    
    router.post('/uploads',(request:Request<{},string,FileUpload>,response:Response<string>)=>{
        handleRequest(uploads.save(request.body),response);
    });


    router.post('/games/:id/join',(request:Request<{id:string},Asset[]>,response:Response<Asset[]>) =>{
        requestAuthorization(request.headers.authorization,response,[Privileges.Play]);
        handleRequest(gameplay.joinGame(request.headers.authorization,request.params.id),response);
    });

    router.get('/instance/gamedata',(request:Request<{id:string},Game>,response:Response<Game>) =>{
        requestAuthorization(request.headers.authorization,response,[Privileges.Play]);
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
    router.delete('/instance/messages/:id',(request:Request<{id:number}>, response:Response<void>) => {
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
    router:Router;
}

export function createAPI(connection:Connection):GameAPI{
    const userService = new UserService(connection);
    const instanceService = new InstanceService(connection);
    const gameplayService = new GameplayService(connection);
    const gameService = new GameService(connection);
    const uploadService = new UploadService(process.env.CDN_URL,process.env.STATIC_FOLDER);
    const router = setupRouter(
        userService,
        instanceService,
        gameplayService,
        gameService,
        uploadService,
        ()=>createSuperuser(connection)
    );
    
    const api : GameAPI = {
        userService,
        instanceService,
        router
    }

    console.log('Api iniciada')
    return api;
}