import { EventEmitter } from "../models/events";
import { countdown, countdownStr, fmtResourceAmount, randomInt, randomItem, toMap } from "../models/functions";
import { Activity,GameEvents, ActivityType, Cell, Game, GameInstance, Placeable, Resource, Technology, PlaceableInstance, ResourceFlow, Stockpile, Properties, flowPeriodRanges, ConstantProperties, InstancePlayer, EnqueuedActivity, CellInstance, MessageContentType, MessageType, ResourceAmount, SpyReport, Message, Vector, SearchResult, TradingAgreement, Asset, Media, User, ActivityTarget, WorldMapQuery, WorldMapSector, WorldPlayer, GameInstanceSummary, LivegameInstanceSummary} from "../models/monolyth";
import { ActivityAvailability, ActivityCost, AttackActivityTarget, BuildingActivityTarget, ClaimActivityTarget, DismantlingActivityTarget, ExplorationActivityTarget, ResearchActivityTarget, SpyActivityTarget } from '../models/activities'
import { CombatPlayer, CombatResult, CombatUnit, CombatUnitInfo, createCombatSummary } from '../models/combat'
import { ServiceError, ServiceErrorCode } from "../models/errors";
import { countInstancePlayers, getMessageSender } from "./sessions";
import {  } from "../models/assets";

const MESSAGES_PER_PAGE = 25;
const DEFAULT_RADIUS = 2;

function filterQueue(queue:EnqueuedActivity[],type:ActivityType):EnqueuedActivity[]{
    return queue.filter( item => item.type == type);
}
// TODO Esto hay que mejorarlo, devuelve un medio vacío solo con el nombre del jugador, ¿donde se ponen los perfiles?
function createPlayerMedia(playerName:string):Media{
    return {
        description:'Biografía del jugador',
        icon:{id:'empty',type:'image',url:''},
        thumbnail:{id:'empty',type:'image',url:''},
        image:{id:'empty',type:'image',url:''},
        name: playerName
    }
}
/**
 * Devuelve el número de recursos por segundo que produce un flujo
 * @param flow Flujo de recursos
 */
 function convertFlowToRPS(flow:ResourceFlow):number{
    return flow.amount / (flowPeriodRanges.get(flow.periodicity)! / 1000);
}


export class ResourceStat{

    constructor(public resource:Resource,public stockpile:Stockpile,public placeables:PlaceableInstance[]){
    }

    get available():number{
        return this.stockpile.amount;
    }

    get totalIncome():number{
        if(this.placeables.length == 0 ) {
            return 0;
        }else {
            return this.placeables
                .map( p => p.instanceFlows)
                .flat()
                .filter( flow => flow.resourceId == this.resource.id && flow.amount >= 0)
                .map( flow => convertFlowToRPS(flow))
                .reduce( (prev,current) => prev+current , 0);
        }
    }
    get totalExpense():number{
        if(this.placeables.length == 0 ) {
            return 0;
        }else {
            return this.placeables
                .map( p => p.instanceFlows)
                .flat()
                .filter( flow => flow.resourceId == this.resource.id && flow.amount < 0)
                .map( flow => convertFlowToRPS(flow))
                .reduce( (prev,current) => prev+current , 0);
        }
    }

}

interface PropertyCalculationParams{
    cells:boolean;
    placeables:boolean;
    technologies:boolean;
    stockpiles:boolean;
}

function combineProperties(a:Properties,b:Properties):Properties{
    const props:Properties = {};

    // Asignar todas las propiedades de 'a' al nuevo objeto
    Object.keys(a).forEach( key => props[key] = a[key]);
    // Asignar todas las propiedades de 'b' que no estén en 'a' y sumar las comunes
    // Nota: Los + que se ven prefijando los valores son para convertir a número.
    // Los tipos de typescript funcionan bien chequeando los tipos en tiempo de compilacion
    // pero en ejecución es javascript puro, y si llega un '', al sumar hace coalescencia
    // a string y empieza a concatenar cadenas en lugar de sumar valores...
    Object.keys(b).forEach( key => {
        if(props[key] !== undefined){
            props[key] += (+b[key]);
        }else{
            props[key] = (+b[key]);
        }
    });

    return props;
}

function checkFlow(flow:ResourceFlow):number{
    let amount = 0;
    const now = Date.now();
    const elapsed = now - (flow.last||0);
    const maxElapsed = flowPeriodRanges.get(flow.periodicity) || 0;
   
    if(elapsed >= maxElapsed){
        amount = flow.amount
        flow.last = now;
    }
    
    return amount;
}

/**
 * Estima si los almacenes tendrán suficiente material para satisfacer
 * una demanda.
 * @param placeable 
 * @param stockpiles 
 * @returns 
 */
 function hasEnoughSuppliesToWork(placeable:PlaceableInstance,stockpiles:Record<string,Stockpile>){
    return placeable.instanceFlows
        .filter( flow => flow.amount < 0)
        .every( flow => Math.abs(flow.amount) <= stockpiles[flow.resourceId].amount)
}

interface GameIndex{
    cells:Record<string,Cell>
    placeables:Record<string,Placeable>;
    resources:Record<string,Resource>;   
    technologies:Record<string,Technology>;
    activities:Map<ActivityType,Activity>;
}
/**
 * Las versiones vivas de las instancias dotan de 
 * funcionalidad a las interfaces GameInstance
 */
export class LiveGameInstance{
    private gamedex:GameIndex;
    private lastQueueCheck:number;
    private queueInterval:NodeJS.Timer;
    private resourceInterval:NodeJS.Timer;
    private startDate:number;
    private assets:Asset[] = [];
    constructor(private instance:GameInstance,private game:Game){

        this.gamedex = {
            cells : toMap(game.cells, (cell) => cell.id),
            placeables : toMap(game.placeables, (placeable) => placeable.id),
            resources : toMap(game.resources, (resource) => resource.id),
            activities : new Map( game.activities.map( activity => [activity.type,activity]) ),
            technologies : toMap(game.technologies, (tech) => tech.id)
        }

        this.startDate = Date.now();
        this.collectAssets();

        /**
         * Aplicar cualquier mejora introducida en el juego
         * 
         * 1.- Reflejar los recursos nuevos de los almacenes de losjugadores
         * (los viejos que se los queden hasta gastarlos)
         */
        const resourceMap = this.gamedex.resources;
        this.instance.players.forEach( player => {
            const stockpileMap = toMap(player.stockpiles, sp => sp.resourceId);
            for(const resId in resourceMap){
                if(!stockpileMap[resId]){
                    player.stockpiles.push({amount:0,resourceId:resId});
                }
            }
        });
        this.resourceInterval = setInterval(this.processResourceFlows.bind(this),1000);
        this.queueInterval = setInterval(this.processQueue.bind(this),100);
        
        console.log('Instancia',this.instance.id,'arrancada');
    }

    stop(){
        clearInterval(this.queueInterval);
        clearInterval(this.resourceInterval);
        console.log('Instancia',this.instance.id,'parada');
    }
    public getGameInstance():GameInstance{
        return this.instance;
    }
    public getStartDate(){
        return this.startDate;
    }

    /**
     * Recolecta toda la información de medios de la instancia
     */
    private collectAssets(){
        const media : Media[] = [];
        media.push(...this.game.activities.map( activity => activity.media));
        media.push(...this.game.cells.map( cell => cell.media));
        media.push(...this.game.placeables.map( placeable => placeable.media));
        media.push(...this.game.resources.map( resource => resource.media));
        media.push(...this.game.technologies.map( technology => technology.media));
        media.push(this.game.media);

        this.assets.push(...media.map( element => [
            element.icon,
            element.image,
            element.thumbnail,
        ]).flat());
        
        
        // Estilos fijos de la sección de interfaz
        // Los estilos fijos se definen durante la creación del
        // juego, e inicialmente tienen los valores determinados
        // en getDefaultStaticAssets()
        this.assets.push(...Object.values(this.game.userInterface.uiAssets));
        // Añadir las texturas!!
        this.assets.push(...this.game.placeables.map( placeable => placeable.texture));
        this.assets.push(...this.game.cells.map( cell => cell.texture));
        this.assets.push(...this.game.technologies.map( tech => tech.texture));

        // Mapeamos y desmapeamos, así eliminamos duplicados (el select distinct de javascript)
        const map = toMap(this.assets,(asset)=>asset.id); 
        
        this.assets = Object.values(map);
        /*this.assets.push({
            id:'game-style',type:'style',url:process.env.CDN_URL+"assets/test.css"
        }as Asset);*/
        /**
         * Esta linea inyecta en los assets el metaestilo de cada juego, generado dinámicamente.
         */
        this.assets.push({
            id:'game-style',type:'style',url:process.env.API_URL+"games/"+this.gameId+"/style.css"
        }as Asset);
    }

    getAssets():Asset[]{
        return this.assets;
    }

    get gameId():string{
        return this.instance.gameId;
    }
    get id():string{
        return this.instance.id;
    }
    /**
     * 
     * @param playerId identificador del jugador
     * @returns La instancia del jugador con el identificador facilitado
     */
    getPlayer(playerId:string):InstancePlayer|undefined{
        return this.instance.players.find( player=>player.playerId == playerId);
    }

    getGameData():Game{
        return this.game;
    }

    /**
     * Devuelve la información básica de un jugador ocultando sus
     * estadísticas e información de juego.
     * @param playerId Identificador del jugador
     * @returns Instancia del jugador con información parcial
     */
    getInstancePlayer(playerId:string):Partial<InstancePlayer>{
        const player = this.instance.players.find( p => p.playerId == playerId);
        if(player){
            return {
                media:player.media,
                playerId:player.playerId
            }
        }else{
            throw <ServiceError> { code: ServiceErrorCode.NotFound, message:'No se ha encontrado el jugador'};
        }
    }

    /**
     * Actualiza el contador de identificadores únicos de la instancia
     * y devuelve el siguiente. Los números en JS/TS tienen un rango 
     * de 2^63, lo que permite generar 292k identificadores únicos por 
     * segundo durante el próximo millón de años. Como este tiempo excede
     * el periodo de servicio de la aplicación, se puede dar por válido.
     * 
     * @returns Un número único a nivel de instancia.
     */
    private nextUUID():number{
        return ++this.instance.nextUUID;
    }

    /*private ticker():void{
        if(this.hasListener(GameEvents.Timer)){
            this.raise(GameEvents.Timer);
        }
    }*/

    getActivityCost(type:ActivityType,target?:ActivityTarget):ActivityCost{
        // TODO El coste de la actividad puede (DEBE) depender del target
        // TIP: Añadir activityEffort a target?
        const activity = this.gamedex.activities.get(type);
        return {
            resources:activity.expenses,
            time:activity.duration,
            duration:countdownStr(countdown(0,activity.duration))
        }
    }

    private getResearchedTechnologies(player:InstancePlayer):Technology[]{
        return player.technologies.map( id => this.gamedex.technologies[id]);
    }

    private getTechnologyDependencies(id:string):Technology[]{
        const deps:Technology[] = [];
        const tech = this.gamedex.technologies[id];
        let parentId = tech.parent;

        while(parentId != null){
            const parent = this.gamedex.technologies[parentId];
            deps.push(parent);
            parentId = parent?.parent;
        }

        return deps.reverse();
    }

    private checkActivityAvailability(player:InstancePlayer,type:ActivityType,target?:ActivityTarget):ActivityAvailability{
        const failedPreconditions:string[] = [];
        const activity = this.gamedex.activities.get(type);
        // Es importante CALCULAR los costes en lugar de acceder directamente
        const cost = this.getActivityCost(type,target);
        // Es necesaria alguna tecnología para comenzar la actividad?
        if(activity.requiredTech){
            const requiredTech = this.gamedex.technologies[activity.requiredTech];
            const researchedTechs = this.getResearchedTechnologies(player);
            if(!researchedTechs.some( tech => tech.id == requiredTech?.id)){
                failedPreconditions.push('Se necesita '+requiredTech?.media.name+' para llevar a cabo esta actividad');
            }
        }
        // Comprobamos que hay suficiente para empezar
        const stockPiles = toMap(player.stockpiles, sp => sp.resourceId);
        // No se puede construir si al menos un almacen tiene menos stock que lo que el flujo requiere
        cost.resources.forEach( expense => {
            if(expense.amount > stockPiles[expense.resourceId].amount){
                const resource = this.gamedex.resources[expense.resourceId];
                failedPreconditions.push('Faltan '+ fmtResourceAmount(expense.amount-stockPiles[expense.resourceId].amount)+' de '+resource?.media.name);
            }
        });
        
        // Si es una tecnología concreta:
        if(type == ActivityType.Research){
            // Debe estar sin investigar
            const techId = (target as ResearchActivityTarget).techId;
            if(player.technologies.some( t => t == techId)){
                failedPreconditions.push('Esta tecnología ya está investigada')
            }
            // No debe estar en cola
            if(player.queue.some( ea => ea.type == ActivityType.Research && (ea.target as ResearchActivityTarget).techId == techId)){
                failedPreconditions.push('Esta tecnología ya está en cola de investigación');
            }
            // Todo el arbol tecnologico previo debe estar desbloqueado
            const depTree = this.getTechnologyDependencies(techId);
            if(depTree.some( dep => player.technologies.indexOf(dep.id) == -1)){
                failedPreconditions.push('Es necesario investigar una tecnología previa');
            }
        }else if(type == ActivityType.Dismantle){
            // El emplazable no debe estar involucrado en otra actividad de desmantelamiento
            const dismantlingTarget = (target as DismantlingActivityTarget);
            const beingDismantled = filterQueue(player.queue,ActivityType.Dismantle).find( ea => {
                const eaTarget = ea.target as DismantlingActivityTarget;
                if(eaTarget.cellInstanceId == dismantlingTarget.cellInstanceId && eaTarget.placeableInstanceId == eaTarget.placeableInstanceId){
                    return ea;
                }
            });

            if(beingDismantled){
                failedPreconditions.push('El emplazable ya está siendo desmantelado');
            }
        }else if(type == ActivityType.Attack){
            /**
             * Las misiones de ataque tienen recursos adicionales en el target, hay que comprobar
             * que, además el coste, los almacenes pueden soportar el gasto adicional.
             */
            const attackTarget = target as AttackActivityTarget;
            const costMap = toMap(cost.resources, res => res.resourceId);
            
            attackTarget.resources.forEach (res => {
                /**
                 * Si el recurso está presente en el coste base de la actividad, comprobar que la
                 * cantidad combinada es compatible con el stock. De lo contrario, solo comprobar
                 * el almacen
                 */
                let extra = 0;
                if(costMap[res.resourceId] !== undefined){
                    extra = costMap[res.resourceId].amount;
                }
                
                if(extra + res.amount > stockPiles[res.resourceId].amount){
                    const resource = this.gamedex.resources[res.resourceId];
                    failedPreconditions.push('Faltan '+ (res.amount+extra-stockPiles[res.resourceId].amount)+' de '+resource?.media.name);
                }
            });
        }

        return {
            available:failedPreconditions.length == 0,
            target,
            type,
            info:failedPreconditions
        }
    }

    getActivities(player:InstancePlayer, type?:ActivityType):EnqueuedActivity[]{
        return player.queue.filter(ea => type ? ea.type == type : true);
    }

    startActivity(player:InstancePlayer, type:ActivityType,target:ActivityTarget):EnqueuedActivity{ 
        console.log('Starting activity',type,'target',target)    

        const availability = this.checkActivityAvailability(player,type,target);
        
        if(availability.available){
            const activity = this.gamedex.activities.get(type);
            const cost = this.getActivityCost(type,target);

            const activityId = this.nextUUID();
            const item:EnqueuedActivity = {
                id:activityId,
                target,
                name:activity.media.name + ' ' + target.name,
                enqueuedAt:Date.now(),
                investment:cost.resources,
                type,
                elapsed:0,
                remaining:cost.time
            };
            
            player.queue.push(item)
            this.onActivityCreated(player,item);
            
            return item;
        }else{
            throw availability;
        }
    }

    changeActivityOrder(player:InstancePlayer, id: number, offset: number): void {
        const currentIndex = player.queue.findIndex( ea => ea.id == id);
        const activity = player.queue.find(ea => ea.id == id);
        const newIndex = currentIndex + offset;
        // Validaciones varias
        if(!activity) throw <ServiceError> {code:ServiceErrorCode.NotFound,message:'No se ha encontrado la actividad solicitada'};
        if(newIndex <= 0) throw <ServiceError> {code:ServiceErrorCode.ServerError,message:'La posición de la actividad no es válida'};
        if(player.queue[newIndex].startedAt || activity?.startedAt) throw <ServiceError> {code:ServiceErrorCode.ServerError,message:'No se puede alterar una actividad en marcha'};

        const aux = player.queue[newIndex]!;
        player.queue[newIndex] = activity!;
        player.queue[currentIndex] = aux;

        this.sendEvent(player,GameEvents.ActivityUpdated,[activity,aux]);
    }

    cancelActivity(player:InstancePlayer, id: number): void {
        let removedActivity = null;

        for(let i = 0; i < player.queue.length; i++){
            if(player.queue[i].id == id){
                removedActivity = player.queue.splice(i,1)[0];
                break;
            }
        }

        if(removedActivity){
            this.onActivityCanceled(player,removedActivity);
        }else{
            throw <ServiceError> {code:ServiceErrorCode.ServerError,message:'La posición de la actividad no es válida'};
        }
    }

    private addResources(player:InstancePlayer, amounts:ResourceAmount[]):void{
        const stockpiles = player.stockpiles;
        const stockpileMap = toMap(stockpiles, sp=>sp.resourceId);

        amounts.forEach(item => {
            stockpileMap[item.resourceId].amount += item.amount;
        })
        
        this.sendEvent(player,GameEvents.StockpilesChanged,stockpiles);
    }

    private removeResources(player:InstancePlayer, amounts:ResourceAmount[]):void{
        const stockpiles = player.stockpiles;
        const stockpileMap = toMap(stockpiles, sp=>sp.resourceId);
        amounts.forEach(item => {
            stockpileMap[item.resourceId].amount -= item.amount;
        })

        this.sendEvent(player,GameEvents.StockpilesChanged,stockpiles);
    }

    private processResourceFlows():void{
        const stats = {
            buildingsWithoutProduction:0,
            totalProduction:0
        }
        this.instance.players.forEach( player => {
            // Indexamos por id de recurso los almacenes 
            const stockpileMap = toMap(player.stockpiles, sp => sp.resourceId);
            player.cells.forEach( cellId => {
                const cell = this.instance.cells[cellId];
                let playerAmount = 0;
                cell.placeables.forEach( pInstance => {
                    // 1.- Puede el almacen funcionar con los recursos disponibles?
                    if(hasEnoughSuppliesToWork(pInstance,stockpileMap)){
                        for(const flow of pInstance.instanceFlows){
                            const stockpile = stockpileMap[flow.resourceId];
                            const amount = checkFlow(flow);
                            if(amount != 0){
                                stockpile.amount += amount;
                                stats.totalProduction+=amount;
                            }
                            playerAmount+=amount;
                        }
                    }else{
                        //console.log('La instancia ',pInstance.id,'del emplazable',pInstance.placeableId,'no tiene recursos para producir');
                        stats.buildingsWithoutProduction++;
                    }
                });
                if(playerAmount>0){
                    this.sendEvent(player,GameEvents.StockpilesChanged,player.stockpiles);
                }
            });
        });
    }

    private calculatePlayerProperties(player:InstancePlayer,include?:PropertyCalculationParams):Properties{        
        if(!player) throw new Error('Player not found');

        include = include || { cells:true,placeables:true,stockpiles:true,technologies:true};
        let props:Properties = {...player.properties};
        // Combinación con propiedades de celdas
        if(include.cells){
            player.cells.map( cellId => this.instance.cells[cellId] ).forEach( cellInstance =>{
                const cellProps = this.gamedex.cells[cellInstance.cellId].properties;
                props = combineProperties(props,cellProps);
    
                cellInstance.placeables
                    .map( pInstance => this.gamedex.placeables[pInstance.placeableId] )
                    .forEach( placeable => {
                        props = combineProperties(props,placeable.properties);
                    });
            });   
        }
        // Combinación con propiedades de almacenes/recursos
        if(include.stockpiles){
            player.stockpiles.forEach( sp => {
                const resource = this.gamedex.resources[sp.resourceId];
                const resProps = {...resource.properties}
                // Las propiedades de los recursos son acumulativas con cada unidad
                for(const key in resProps){
                    resProps[key] = resProps[key] * sp.amount;
                }
                props = combineProperties(props,resProps);
            });
        }
        // Combinación con propiedades de tecnologías investigadas
        if(include.technologies){
            player.technologies.forEach( techId => {
                const technology = this.gamedex.technologies[techId]!;
                props = combineProperties(props,technology.properties!);            
            })
        }

        return props;
    }

    private processQueue():void{
        const now = Date.now();

        this.instance.players.forEach(player=>{
            const props = this.calculatePlayerProperties(player);
            const queueNumProcesses = props[ConstantProperties.QueueNumProcesses]||0;
            
            let i = 0;
            let cummulativeTime = 0;
            
            const queue = player.queue;
            while(i < queue.length){
                const item = queue[i];
                const activity = this.gamedex.activities.get(item.type);
                
                if(item.elapsed>=activity.duration){
                    const deleted = queue.splice(i,1);
                    // Gestionar el fin de actividad
                    this.onActivityFinished(player,deleted[0]);
                }else{
                    if(i < queueNumProcesses){
                        // Solo se actualiza el tiempo de aquellas
                        // tareas que la cola es capaz de procesar
                        if(!item.startedAt){
                            // Si la actividad comienza ahora, se establece
                            // la marca de tiempo de inicio.
                            item.startedAt = now;
                            this.sendEvent(player,GameEvents.ActivityUpdated,item)
                        }
    
                        item.elapsed += now - this.lastQueueCheck;
                        item.remaining = activity.duration - item.elapsed;
                    }else{
                        // Ajustamos el tiempo restante para mostrar la cuenta atrás
                        // hasta su inicio
                        item.remaining = cummulativeTime;
                    }
                    
                    //console.log('Actividad',activity.type,'quedan',activity.duration-item.elapsed);
                    cummulativeTime+=item.remaining;
                }
    
                i++;
            }
        })
        this.lastQueueCheck = now;
    }

    private onActivityCreated(player:InstancePlayer, item:EnqueuedActivity):void{
        // Descontamos el coste de la actividad de los almacenes
        this.removeResources(player,item.investment);
        this.sendEvent(player,GameEvents.ActivityEnqueued,item);
        if(item.type == ActivityType.Build){
            /**
             * Cuando se inicia una actividad de construcción se añade automáticamente
             * el emplazable a la celda y se marca como inactivo. Al completar la actividad
             * se marca como activo. Mientras se encuentre inactivo los flujos no deben
             * procesarse.
             */
             this.buildInactivePlaceable(player,item.target as BuildingActivityTarget);
        }else if(item.type == ActivityType.Dismantle){
            // Ningun disparador previo
        }else if(item.type == ActivityType.Spy){
            // Ningun disparador previo
        }
    }
    private onActivityFinished(player:InstancePlayer,item:EnqueuedActivity):void{
        this.sendEvent(player,GameEvents.ActivityFinished,item);
        if(item.type == ActivityType.Build){
            this.activatePlaceable(player,item.target as BuildingActivityTarget);
        }else if(item.type == ActivityType.Research){
            this.finishResearch(player,item.target as ResearchActivityTarget);
        }else if(item.type == ActivityType.Spy){
            this.createSpyReport(player,item.target as SpyActivityTarget);
        }else if(item.type == ActivityType.Dismantle){
            this.dismantleBuilding(player,item.target as DismantlingActivityTarget);
        }else if(item.type == ActivityType.Attack){
            this.attackPlayer(player,item.target as AttackActivityTarget);
        }else if(item.type == ActivityType.Explore){
            this.exploreCell(player,item.target as ExplorationActivityTarget);
        }else if(item.type == ActivityType.Claim){
            this.claimCell(player,item.target as ClaimActivityTarget);
        }
    }

    private claimCell(player:InstancePlayer,target:ClaimActivityTarget){
        const cell = this.instance.cells[target.cellInstanceId];
        if(cell.playerId == null){
            // Palante
            cell.playerId = player.playerId;
            player.cells.push(cell.id); // El vinculo jugador/celda es bidireccional
            this.sendEvent(player,GameEvents.CellInstanceUpdated,cell);
            this.sendEvent(player,GameEvents.PlayerInstanceUpdated,player);
        }else{
            // Es posible que alguien se haya hecho con la celda antes que el jugador
            this.sendMessageToPlayer({
                srcPlayerId:null,
                dstPlayerId:player.playerId,
                contentType:MessageContentType.Plain,
                subject:'La reclamación ha fallado',
                type:MessageType.Notification,
                id:this.nextUUID(),
                message:'La misión de reclamación de la celda ha fallado, otro jugador la ha ocupado antes de llegar.',
                sendAt:Date.now()
            })
        }
    }

    private exploreCell(player:InstancePlayer, target:ExplorationActivityTarget){
        const cell = this.instance.cells[target.cellInstanceId];
        player.exploredCells?.push(target.cellInstanceId);
        this.sendEvent(player,GameEvents.CellInstanceUpdated,cell);
        this.sendEvent(player,GameEvents.PlayerInstanceUpdated,player);
    }

    private dismantleBuilding(player:InstancePlayer,target:DismantlingActivityTarget){
        this.removePlaceableInstance(target.cellInstanceId,target.placeableInstanceId);
        this.sendMessageToPlayer({
            srcPlayerId:null,
            dstPlayerId:player.playerId,
            subject:'Edificio desmantelado',
            type:MessageType.Notification,
            contentType:MessageContentType.Plain,
            sendAt:Date.now()
        });
    }

    private getPlayerPlaceables(player:InstancePlayer):PlaceableInstance[]{
        const cellInstances = player!.cells.map( id => this.instance.cells[id] );
        const placeables = cellInstances.map( cInstance => cInstance.placeables).flat();
        return placeables;
    }

    getWorldMap(query: WorldMapQuery): WorldMapSector {
        const playerMap:Record<string,WorldPlayer> = {};
        const w = query.p2.x-query.p1.x;
        const h = query.p2.y-query.p1.y;
        const sector:WorldMapSector = {
            map:[],
            height:h,
            width:w,
            players:[]
        }

        const size = this.instance.size;

        for(let y = query.p1.y; y < query.p2.y; y++){
            for(let x = query.p1.x; x < query.p2.x; x++){
                // Referencia a la instancia de celda sobre la que se itera
                // en caso de que esté dentro de los limites del mapa
                if(y >= 0 && x >= 0 && x < size &&  y < size){
                    const cell = this.instance.cells[y*size+x];
                    // Si la celda que cae en el sector tiene propietario, este
                    // debe aparecer en la lista de jugadores
                    if(cell.playerId !=null){
                        if(!playerMap[cell.playerId]){
                            // A la primera aparición, se añade a la lista
                            playerMap[cell.playerId] = {
                                playerId:cell.playerId,
                                media:this.instance.players.find( player => player.playerId == cell.playerId)!.media
                            }
                        }
                    }
                    sector.map.push({
                        position:cell.position,
                        cellId:cell.cellId,
                        color:this.gamedex.cells[cell.cellId].color,
                        playerId:cell.playerId||undefined
                    });
                }else{
                    sector.map.push({
                        position:new Vector(x,y),
                        color:'#f0f0f0'
                    }); 
                }  
            }
        }

        // Se mapean los jugadores a partir de los descriptores de jugador recolectados
        // TODO: Esto es un MOCK, cuando migres al servidor usa los jugadores reales de
        // la coleccion players
        sector.players = Object.entries(playerMap).map( entry => entry[1] );

        return sector;
        
    }

    private attackPlayer(player:InstancePlayer, target:AttackActivityTarget){
        /**
         * A continuación se describe la resolución de un combate:
         * 1.- Se calculan las estadisticas de ambos jugadores
         * 2.- Se enfrenta el ataque con la defensa de ambos para determinar el resultado
         * 3.- Se evalua el impacto de la ofensiva en los edificios del defensor
         * 4.- Se evalua el impacto de la ofensiva en las celdas del defensor
         * 5.- Se evalua el impacto de la ofensiva en los almacenes del defensor
         * 6.- Se evalua el impacto de la defensa en el contingente de ataque
         * 7.- Se evalua el botín obtenido por el atacante en caso de éxito
         */

        const attacker = player;
        // En el ataque no se tienen en cuenta las celdas, edificios ni almacenes del atacante.
        const attackerProps = this.calculatePlayerProperties(attacker,{cells:false,placeables:false,stockpiles:false,technologies:true});
        // Representación de combate del atacante
        const attackerCombatPlayer = new CombatPlayer(
            attacker,
            attackerProps,
            target.resources.map( res => new CombatUnit({
                id:res.resourceId,
                type:'resource',
                props:this.gamedex.resources[res.resourceId].properties,
                amount:res.amount
            }))
        );

        const defender = this.instance.players.find( player => player.playerId == target.instancePlayerId)!;
        // Propiedades del defensor, se emplean todos los elementos del juego para darle ventaja.
        const defenderProps = this.calculatePlayerProperties(defender);
        /**
         * El contingente del defensor son todos los recursos hábiles para el combate.
         * Todos los edificios son objetivos de guerra
         */
        const defenderBuildingsById:Record<string,number> = {};
        // Calculamos la cantidad de edificios de cada tipo que tiene el defensor para armar los CombatUnit
        this.getPlayerPlaceables(defender).forEach(pInstance => {
            if(defenderBuildingsById[pInstance.placeableId] == undefined){
                defenderBuildingsById[pInstance.placeableId] = 1;
            }else{
                defenderBuildingsById[pInstance.placeableId]++;
            }
        });
        // Construimos la lista de emplazables con sus respectivas cantidades
        const defenderBuildings = Object
            .entries(defenderBuildingsById)
            .map( entry => ({
                amount:entry[1],
                id:entry[0],
                type:'placeable',
                props:this.gamedex.placeables[entry[0]].properties
            } as CombatUnitInfo));
        // Obtenemos la lista de recursos aptos para la batalla
        const warlikeResources = defender.stockpiles
            .map( sp => ({
                id:sp.resourceId,
                type:'resource',
                props:this.gamedex.resources[sp.resourceId].properties,
                amount:sp.amount
            } as CombatUnitInfo)).filter( res => {
                const hasAttack  = res.props[ConstantProperties.Attack] != undefined;
                const hasDefence  = res.props[ConstantProperties.Defence] != undefined;
                
                if(hasAttack || hasDefence) return res;
            });

        const defenderContingent = [...warlikeResources,...defenderBuildings];
        const defenderCombatPlayer = new CombatPlayer(defender,defenderProps,defenderContingent.map(unit=>new CombatUnit(unit)));
        // Ejecutar el ataque
        const report = attackerCombatPlayer.attack(defenderCombatPlayer);
        const reward:ResourceAmount[] =  [];

        if(report.result != CombatResult.Tie){
            // 1.- Eliminar recursos
            this.removeResources(defender,report.defenderDestroyedResources);
            // Recolectar todos los emplazables del jugador y las celdas donde se encuentran para borrarlos
            defender.cells
                .map( id => this.instance.cells[id].placeables.map( pi => ({
                    cellInstanceId:id,pInstanceId:pi.id
                })))
                .flat()
                .forEach( item => {
                    this.removePlaceableInstance(item.cellInstanceId,item.pInstanceId)
                });
            
            // 3.- Eliminar los recursos destruidos del atacante
            this.removeResources(attacker,report.attackerDestroyedResources);

            // 4.- Si el ganador es el atacante, darle su premio
            if(report.result == CombatResult.AttackerWin){                
                /** 
                 * Por cada tipo de unidad enviada se elige un almacen y se extrae
                 * tanto material como el recurso pueda transportar. El número de recursos
                 * a transportar depende del peso de cada uno. Cuantos mas tipos de recursos
                 * enviados, mayor diversidad de recursos se extraerán.
                 */
                for(let i = 0;i < report.attacker.units.length; i++){
                    const cUnit = report.attacker.units[i];
                    const stockpile = randomItem(defender.stockpiles);
                    const resource = this.gamedex.resources[stockpile.resourceId];
                    const resWeight = resource.properties[ConstantProperties.Weight] || 1;
                    const toBeRemoved = Math.min(stockpile.amount,cUnit.capacity / resWeight);
                    reward.push({amount:toBeRemoved,resourceId:resource.id});
                }
                // Ajustamos cada almacen para reflejar el botin
                this.addResources(attacker,reward);
                this.removeResources(defender,reward);
            }
        }

        const summary = createCombatSummary(report,reward);
        
        this.sendMessageToPlayer({
            contentType:MessageContentType.AttackReport,
            srcPlayerId:null,
            dstPlayerId:attacker.playerId,
            subject:'Misión de ataque completada',
            type:MessageType.Report,
            id:this.nextUUID(),
            message:summary,
            sendAt:Date.now()
        });
        
        return summary;
    }

    private createSpyReport(player:InstancePlayer,target:SpyActivityTarget){
        const opponent = this.instance.players.find(ip => ip.playerId == target.instancePlayerId);
        const selfProps = this.calculatePlayerProperties(player);
        const opponentProps = this.calculatePlayerProperties(opponent);

        const success = selfProps[ConstantProperties.SpySucceed] || 0;
        const fail = opponentProps[ConstantProperties.SpyAvoid] || 1;

        // Es una comprobación un poco naive, pero es mejor no complicarse innecesariamente
        let report:SpyReport;
        const opponentBuildingCount = opponent!.cells
            .map( id => this.instance.cells[id])
            .map(cInstance => cInstance?.placeables.length )
            .reduce( (prev,current) => (current||0)+(prev||0) , 0);

        const successProb = (100 * success / fail).toFixed(2);
        if(success > fail){
            /**
             * Hay que tener cuidado con el orden de eficiciencia de
             * determinados algoritmos, ya que aquí no hay posibilidad
             * de hacer multitarea y no se debe bloquear el hilo principal.
             * Por ejemplo, no es buena idea (en ningún caso) iterar a través
             * de todas las celdas de la instancia (500 x 500).
             * Ante la duda, delegar en el cliente para que lance una nueva
             * solicitud y se procese aparte.
             */
            report = {
                success:true,
                probability:successProb,
                playerId:target.instancePlayerId,
                playerName:opponent!.media.name,
                cells:opponent!.cells.length,
                properties:opponentProps,
                buildings:opponentBuildingCount,
                technologies:opponent!.technologies,
                stockpiles:opponent!.stockpiles
            };
        }else{
            report = {
                success:false,
                probability:successProb
            }
        }

        const notification:Message = {
            srcPlayerId:null,
            dstPlayerId:player.playerId,
            subject:'Informe de espionaje a '+opponent!.media.name,
            type:MessageType.Report,
            contentType:MessageContentType.SpyReport,
            sendAt:Date.now(),
            id:this.nextUUID(),
            senderName:player.media.name,
            message:report
        }

        this.sendMessageToPlayer(notification);
    }

    private onActivityCanceled(player:InstancePlayer,item:EnqueuedActivity):void{
        // Primero, devolver el coste de la actividad
        const stockPiles = toMap(player.stockpiles, sp => sp.resourceId);
        this.addResources(player,item.investment);

        if(item.type == ActivityType.Build){
            const target = item.target as BuildingActivityTarget;
            this.removePlaceableInstance(target.cellInstanceId,target.placeableInstanceId!);
        }

        this.sendEvent(player,GameEvents.ActivityCanceled,item);
    }

    private finishResearch(player:InstancePlayer,target:ResearchActivityTarget){
        player.technologies.push(target.techId);
        this.sendEvent(player,GameEvents.TechnologyResearched,target.techId);
    }

    /**
     * Termina el ciclo de construcción de un edificio, permitiendo
     * que sus flujos y características se activen.
     * 
     * @param target Objetivo sobre el que actua la actividad
     */
     private activatePlaceable(player:InstancePlayer,target:BuildingActivityTarget){
        const cellInstance = this.instance.cells[target.cellInstanceId];
        const placeableInstance = cellInstance.placeables.find( pi => pi.id == target.placeableInstanceId);
        if(placeableInstance) {
            placeableInstance.built = true;
            this.sendEvent(player,GameEvents.CellInstanceUpdated,cellInstance);
            this.sendEvent(player,GameEvents.PlaceableFinished,placeableInstance);
        }else{
            throw new Error('Error al activar, no se ha encontrado la instancia del emplazable');
        }
    }

    private buildInactivePlaceable(player:InstancePlayer,target:BuildingActivityTarget){
        const cellInstance = this.instance.cells[target.cellInstanceId];
        const placeable = this.gamedex.placeables[target.placeableId];
        const placeableInstanceId = this.nextUUID();
        cellInstance.placeables.push({
            id:placeableInstanceId,
            built:false,
            instanceFlows:placeable?.flows.map( flow => ({...flow})), // Se copian los flujos del original al crear
            placeableId:target.placeableId
        });
        // Vinculamos el target con el recien creado edificio para
        // poder activarlo al terminar la tarea
        target.placeableInstanceId = placeableInstanceId;
        this.sendEvent(player,GameEvents.CellInstanceUpdated,cellInstance);
    }

    /**
     * Elimina un emplazable de una celda
     * @param cellInstanceId Identificador de la celda
     * @param placeableInstanceId Identificador del emplazable
     */
     private removePlaceableInstance(cellInstanceId:number,placeableInstanceId:number){
        const cellInstance = this.instance.cells[cellInstanceId];
        const owner = this.getPlayer(cellInstance.playerId);
        for(let i = 0; i <cellInstance.placeables.length; i++){
            if(cellInstance.placeables[i].id == placeableInstanceId){
                const deleted = cellInstance.placeables.splice(i,1);
                /**
                 * Notificacion de actualización de la celda. Al contrario que muchas
                 * otras operaciones, aquí no se recibe la instancia del jugador. Esto se
                 * debe a que una acción de un jugador puede hacer que se elimine una instancia
                 * de un emplazable de otro, creando así una notificación de la qu no será 
                 * destinatario. En consecuencia, buscamos como destinatario del evento
                 * al propietario de la celda
                 */
                this.sendEvent(owner,GameEvents.CellInstanceUpdated,cellInstance);
                console.log('Se han eliminado los emplazables',deleted);
                break;
            }
        }
    }

    private sendMessageToPlayer(message:Message){
        this.instance.playerMessages.push(message);
        const rcpt = this.getPlayer(message.dstPlayerId);
        this.sendEvent(rcpt,GameEvents.IncomingMessage,message);
    }

    getCells(player:InstancePlayer):CellInstance[] {
        console.log('Cargando celdas del servidor');
        /**
         * Las celdas visibles para el jugador serán:
         * - Las de su propiedad
         * - Las que se encuentren a un radio x de la celda principal
         * El radio aumenta con la tecnología adecuada
         * Solo se pueden explorar y reclamar celdas en el area de influencia
         */
        //
        const mainCell = this.instance.cells[player.cells[0]];
        const visibleCells:CellInstance[] = [];
        const props = this.calculatePlayerProperties(player);
        const radius = props[ConstantProperties.InfluenceRadius] || DEFAULT_RADIUS;
        for(let y = mainCell.position.y-radius;y < mainCell.position.y+radius;y++){
            for(let x = mainCell.position.x-radius;x < mainCell.position.x+radius;x++){
                if(x >= 0 && y >= 0 && x < this.instance.size && y < this.instance.size){
                    if(new Vector(x,y).distance(mainCell.position) <= radius){
                        const cell = this.instance.cells[y* this.instance.size+x];
                        if(cell.playerId == player.playerId){
                            // Damos toda la info
                            visibleCells.push(cell);
                        }else{
                            if(player.exploredCells?.some( cid => cid == cell.id)){
                                // Esta celda ya había sido explorada, devolvemos todos los datos
                                visibleCells.push(cell);
                            }else{
                                // Esta celda no se ha explorado, ocultamos terreno, props, etc
                                visibleCells.push({
                                    position:cell.position,
                                    id:cell.id,
                                    cellId:this.game.config.unknownCellId,
                                    placeables:[],
                                    playerId:null
                                })
                            }
                        }
                    }
                }
            }    
        }

        return visibleCells;
    }

    calculateResourceStats(player:InstancePlayer):ResourceStat[] {
        const stockpiles = toMap(player.stockpiles, sp => sp.resourceId);
        const builtPlaceables = player.cells
            .map( cellId => this.instance.cells[cellId].placeables)
            .flat()
            .filter( placeable => hasEnoughSuppliesToWork(placeable,stockpiles));
            
        
        const stats:ResourceStat[] = Object
            .entries(this.gamedex.resources)
            .map( entry => entry[1])
            .sort( (a,b) => a.media.name > b.media.name ? 1 : -1)
            .map( resource => new ResourceStat(resource,stockpiles[resource.id],builtPlaceables));

        return stats;
    }
    
    sendTradeAgreement(agreement:TradingAgreement):number{
        const sender = this.instance.players.find( player => player.playerId == agreement.srcPlayerId)!;
        const receiver = this.instance.players.find( player => player.playerId == agreement.dstPlayerId)!;
        // Los recursos del tratado se bloquean hasta su aceptación o cancelación
        this.removeResources(sender,agreement.offer);

        // 1.- Añadir a la lista de tratos comerciales pendientes de aceptar en la instancia
        agreement.id = this.nextUUID();
        this.instance.pendingTradingAgreements.push(agreement);
        
        // 2.- Generar la notificación para el oponente
        // TODO Esto no está siquiera disponible en el cliente
        // 3.- Generar la notificación para el emisor
        this.sendMessageToPlayer({
            id:this.nextUUID(),
            dstPlayerId:agreement.dstPlayerId,
            srcPlayerId:sender.playerId,
            senderName:sender.media.name,
            type:MessageType.Notification,
            contentType:MessageContentType.TradeReport,
            subject:"Propuesta comercial",
            message:agreement,
            sendAt:Date.now()
        });

        return agreement.id;
    }

    private deleteTradingAgreement(id:number){
        this.instance.pendingTradingAgreements = this.instance.pendingTradingAgreements.filter(
            item => item.id != id
        );
    }

    cancelTradeAgreement(player:InstancePlayer,id:number):void{
        const agreement = this.instance.pendingTradingAgreements.find( ta => ta.id == id);
        const srcPlayer = this.instance.players.find( player => player.playerId == agreement?.srcPlayerId);
        const dstPlayer = this.instance.players.find( player => player.playerId == agreement?.dstPlayerId);
        const players = [agreement?.srcPlayerId,agreement?.dstPlayerId];
        const initiator = player;
        
        /**
         * Un acuerdo comercial lo puede cancelar cualquiera de los jugadores
         * involucrados. Al cancelar el acuerdo comercial, el emisor recupera
         * los recursos invertidos.
         */            
        if(!agreement){
            throw <ServiceError>{code:ServiceErrorCode.NotFound,message:'No se ha encontrado el tratado comercial'};
        }else if(!srcPlayer || !dstPlayer){
            throw <ServiceError>{code:ServiceErrorCode.Conflict,message:'No se ha encontrado el jugador'};
        }else if(players.indexOf(initiator.playerId) == -1){
            throw <ServiceError>{code:ServiceErrorCode.Forbidden,message:'El jugador no puede cancelar un pacto en el que no está involucrado'};
        }else{
            // Se devuelven los recursos al jugador que inició el tratado
            this.addResources(srcPlayer,agreement.offer);

            // Se genera una notificación para el emisor indicando
            // que la oferta se ha cancelado y que recupera sus recursos
            this.sendMessageToPlayer({
                contentType:MessageContentType.Plain,
                srcPlayerId:null,
                dstPlayerId:srcPlayer.playerId,
                message:'El jugador '+initiator.media.name+' ha cancelado el acuerdo comercial, tus recursos han sido devueltos.',
                subject:'Acuerdo comercial cancelado',
                type:MessageType.Notification,
                id:this.nextUUID(),
                sendAt:Date.now()
            });

            // Se genera una notificación para el receptor indicando
            // que la oferta se ha cancelado.
            this.sendMessageToPlayer({
                contentType:MessageContentType.Plain,
                srcPlayerId:null,
                dstPlayerId:dstPlayer.playerId,
                message:'El acuerdo comercial con '+srcPlayer.media.name+' ha sido cancelado.',
                subject:'Acuerdo comercial cancelado',
                type:MessageType.Notification,
                id:this.nextUUID(),
                sendAt:Date.now()
            });

            // Finalmente, se borra el tratado de la lista de pendientes
            this.deleteTradingAgreement(id);
        }
    }

    acceptTradeAgreement(player:InstancePlayer,id:number):void{
        const agreement = this.instance.pendingTradingAgreements.find( ta => ta.id == id);
        const srcPlayer = this.instance.players.find( player => player.playerId == agreement?.srcPlayerId)!;
        const dstPlayer = this.instance.players.find( player => player.playerId == agreement?.dstPlayerId);

        if(!agreement){ // existe el acuerdo?
            throw new Error('No se ha encontrado el tratado comercial');
        }else if(player.playerId == dstPlayer?.playerId){ // El que acepta debe ser necesariamente dstPlayer
            // Se quitan al jugador que acepta los recursos requeridos
            this.removeResources(dstPlayer,agreement.request);
            // Se dan al jugador que acepta los recursos ofertados
            this.addResources(dstPlayer,agreement.offer);
            // Se dan al jugador que envía los recursos requeridos
            // sin quitarle nada, ya se le descontó la oferta al enviar.
            this.addResources(srcPlayer,agreement.request);

            // Finalmente, se borra el tratado de la lista de pendientes
            this.deleteTradingAgreement(id);
            
            // Notificar a ambos jugadores
            this.sendMessageToPlayer({
                id:this.nextUUID(),type:MessageType.Notification,contentType:MessageContentType.Plain,
                srcPlayerId:null,dstPlayerId:srcPlayer.playerId,
                message:'El acuerdo comercial con '+dstPlayer.media.name+' se ha completado con éxito',
                subject:'Acuerdo comercial completado',sendAt:Date.now()
            });
            this.sendMessageToPlayer({
                id:this.nextUUID(),type:MessageType.Notification,contentType:MessageContentType.Plain,
                srcPlayerId:null,dstPlayerId:dstPlayer.playerId,
                message:'El acuerdo comercial con '+dstPlayer.media.name+' se ha completado con éxito',
                subject:'Acuerdo comercial completado',sendAt:Date.now()
            });
        }
    }

    getTradingAgreement(player:InstancePlayer,id:number):TradingAgreement{
        const agreement = this.instance.pendingTradingAgreements.find( agreement => agreement.id == id );
        if(agreement){
            if(agreement.srcPlayerId == player.playerId || agreement.dstPlayerId == player.playerId){
                return agreement;
            }else{
                throw <ServiceError> { code:ServiceErrorCode.Forbidden, message:'El jugador debe estar involucrado para poder consultar un trato comercial.'}
            }
        }else{
            throw <ServiceError> {code:ServiceErrorCode.NotFound, message:'No se ha encontrado el trato comercial.'}
        }
    }

    getMessages(player:InstancePlayer,text:string, type: MessageType, page: number): SearchResult<Message> {
        console.log('Buscando mensajes de jugador',text,type,page)
        const offset = MESSAGES_PER_PAGE * (page-1); // aunque el cliente usa el rango [1,n], la api usa [0,n) o [0,n-1]
        const found = this.instance.playerMessages.filter( msg => 
            msg.type == type && 
            msg.subject.indexOf(text) >= 0 &&
            msg.dstPlayerId == player.playerId
        );
        
        const result:SearchResult<Message> = {
             count:found.length,
             page,
             pages: Math.ceil(found.length / MESSAGES_PER_PAGE),
             results: found.slice(offset,offset+MESSAGES_PER_PAGE).sort( (a,b)=> (b.sendAt||0) - (a.sendAt||0))
        }
        
        return result;
    }

    private sendEvent(player:InstancePlayer,type:string,data:any):void{
        const send = getMessageSender(player.playerId);
        if(send){
            send({type,data});
            console.log(type,' event sent to LIVE player',player.playerId);
        }else{
            console.log(type,' event sent to DISCONNECTED player',player.playerId);
        }
    }
    sendMessage(player:InstancePlayer,dstPlayerId:string,subject:string,message:string):number{
        const msg:Message = {
            id:this.nextUUID(),
            type:MessageType.Message,
            contentType:MessageContentType.Plain,
            dstPlayerId,
            message,
            srcPlayerId:player.playerId,
            subject,
            sendAt:Date.now(),
            senderName: player.media.name
        }

        this.sendMessageToPlayer(msg);

        return msg.id;
    }
    
    deleteMessage(player:InstancePlayer,id:number):void{
        for(let i = 0; i< this.instance.playerMessages.length; i++){
            const msg = this.instance.playerMessages[i];
            // Solo un jugador puede borrar los mensajes que le han sido enviados
            if(msg.id == id && msg.dstPlayerId == player.playerId){
                this.instance.playerMessages.splice(i,1);
                break;
            }
        }
    }

    /**
     * Busca una celda libre aleatoria en el mapa.
     * 
     */
    private findEmptyCell():CellInstance{
        let found = false;        
        const size = this.instance.size;
        let cell:CellInstance;

        while(!found){
            const i = randomInt(size*size)
            if(this.instance.cells[i].playerId == null){
                cell = this.instance.cells[i];
                found = true;
            }
        }

        return cell;
    }
    private countFreeCells():number{
        const totalCells = this.instance.cells.length;
        return totalCells - this.instance.players
            .map( player => player.cells.length)
            .reduce( (prev,next) => prev+next, 0);;
    }
    /**
     * Determina si se pueden añadir nuevos jugadores.
     * Por defecto, se establece que cuando el número
     * de celdas libres está por debajo del 10% del total
     * ya no se aceptarán más jugadores. Esto evita que 
     * entren nuevos jugadores con poco espacio para 
     * desarrollarse.
     */
    canAddNewPlayers():boolean{
        return (this.countFreeCells() / this.instance.cells.length) > 0.1;
    }

    createPlayer(player:User):InstancePlayer{
        if(this.instance.players.some( p => p.playerId == player.id)){
            throw <ServiceError>{ code:ServiceErrorCode.Conflict , message:'Ya existe este jugador en la instancia '+this.instance.id};
        }else{
            const instancePlayer : InstancePlayer = {
                cells:[],
                instanceId:this.instance.id,
                media:createPlayerMedia(player.name),
                queue:[],
                stockpiles:this.game.resources.map( res => ({amount:10000,resourceId:res.id,}) ), // TODO Esto va al backoffice, sección jugador
                technologies:[],
                playerId:player.id,
                properties:{...this.game.config.defaultPlayerProperties},
                exploredCells:[]
            };

            // Se busca una celda libre para ubicarlo
            const initialCell = this.findEmptyCell();
            // Se vinculan mutuamente la celda y el jugador
            initialCell.playerId = instancePlayer.playerId;
            instancePlayer.exploredCells.push(initialCell.id);
            instancePlayer.cells.push(initialCell.id)
            
            // Agregamos el jugador a la lista
            this.instance.players.push(instancePlayer);
            
            // A otra cosa
            return instancePlayer;
        }
    }
}
const instances:Record<string,LiveGameInstance> = {};

export function addInstance(instance:GameInstance, game:Game){
    if(instance.id == null) throw new Error('El identificador de la instancia no es valido');
    if(instances[instance.id] !== undefined) throw new Error('La instancia ya está en memoria');

    instances[instance.id] = new LiveGameInstance(instance,game);
}

export function getInstances():LiveGameInstance[]{
    return Object.values(instances);
}

/**
 * Para una instancia, borra todos sus temporizadores y la saca de memoria.
 * @param id  Identificador de la instancia
 */
export function removeInstance(id:string):GameInstance{
    const instance = getInstance(id);
   
    instance.stop();
    delete instances[id];
    console.log('Instancia',id,'eliminada');

    return instance.getGameInstance();
}

export function getSummaries():Record<string,LivegameInstanceSummary>{
    const summaries : Record<string,LivegameInstanceSummary> = {};
    
    for(const id in instances){
        summaries[id] = {
            connectedPlayers:countInstancePlayers(id),
            uptime:Date.now()-instances[id].getStartDate(),

        }
    }

    return summaries;
}

export function getInstance(id:string):LiveGameInstance{
    if(instances[id] == null) throw new Error('La instancia no se encuentra en memoria');
    return instances[id];
}