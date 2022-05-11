

export const GameEvents = {
    StockpilesChanged:'stockpiles_changed',
    ActivityFinished:'activity_finished',
    ActivityCanceled:'activity_canceled',
    ActivityEnqueued:'activity_enqueued',
    ActivityUpdated:'activity_updated',
    TradingCreated:'trading_created',
    TradingRejected:'trading_rejected',
    TradingAccepted:'trading_accepted',
    CellInstanceUpdated:'cell_instance_updated',
    PlayerInstanceUpdated:'player_instance_updated',
    TechnologyResearched:'technology_researched',
    IncomingMessage:'incoming_message',
    PlaceableFinished:'placeable_finished',
    ResearchCompleted:'research_completed',
    Timer:'timer'
}

export type WithAmount<T> = T & {
    amount:number;
}

export const ConstantProperties = {
    QueueCapacity:'queueCapacity',
    QueueNumProcesses:'queueNumProcesses',
    SpySucceed:'spySucceed',
    SpyAvoid:'spyAvoid',
    Attack:'attack',
    Defence:'defence',
    Health:'health',
    Luck:'luck',
    Indestructible:'indestructible',
    TransportCapacity:'transportCapacity',
    InfluenceRadius:'influenceRadius',
    Weight:'weight'
};

type Property = {
    [propName:string]:string|number;
}

export interface Properties{
    [propName:string]:number;
}

export interface SearchResult<T>{
    count:number;
    page:number;
    pages:number;
    results:T[];
}
type Pagination = {
    page:number;
    itemsPerPage:number;
}
type Sorting = {
    field:string;
    dir:'asc'|'desc';
}

export class Vector{
    constructor(public x:number = 0, public y :number = 0){}
    copy(){
        return new Vector(this.x,this.y);
    }
    add(vector:Vector):Vector{
        this.x+=vector.x;
        this.y+=vector.y;
        return this;
    }
    sub(vector:Vector):Vector{
        this.x-=vector.x;
        this.y-=vector.y;

        return this;
    }
    zero():Vector{
        this.x = 0;
        this.y = 0;
        return this;
    }
    multiply(scalar:number):Vector{
        this.x*=scalar;
        this.y*=scalar;
        return this;
    }
    negate():Vector{
        return this.multiply(-1);
    }
    distance(vector:Vector):number{
        return Math.sqrt((vector.y - this.y)*(vector.y - this.y ) + (vector.x - this.x ) * (vector.x - this.x));
    }
}

export interface UIConfig{
    uiControlFontFamily:string;
    uiControlBackgroundColor:string;
    uiControlForegroundColor:string;
    uiControlFontColor:string;
    uiControlFontColorDanger:string;
    uiControlFontColorDisabled:string;
    uiControlTextSize:string;
    uiControlTextHeadingSize:string;
    uiControlShadowColor:string;
    uiControlBorderColor:string;
    uiControlBorderRadius:string;
    uiControlBackgroundPrimary:string;
    uiControlBackgroundSecondary:string;
}

export interface Asset{
    id:string;
    url:string;
    type:'image'|'sound'|'text'|'json';
    data?:any
}
export interface Media{
    name: string;
    description: string;
    icon: Asset;
    thumbnail: Asset;
    image: Asset;
}

export type WithMedia<T> = T & {
    media:Media;
}
export interface Properties extends Record<string,any>{
    
}
export enum ActivityType{
    Spy,            // cells / players
    Dismantle,      // placeables
    Build,          // cells / structures
    Explore,        // cells
    Attack,         // cells / players
    Research,       // techs
    Trade,          // w/ players
    Claim,          // cells
    Message         // players
}

export interface Activity{
    type:ActivityType;
    properties:Properties;
    requiredTech?:string;
    media:Media;
    expenses:ResourceAmount[];
    duration:number;
}

export interface ActivityTarget{
    name:string;
}
export interface EnqueuedActivity{
    id:number;
    name:string;
    investment:ResourceAmount[]; // Recursos empleados para llevar a cabo la actividad, necesario para devolver al cancelar
    type:ActivityType;
    target:ActivityTarget;
    elapsed:number;
    enqueuedAt:number;
    startedAt?:number;
    remaining?:number;
}
export interface Resource{
    id:string;
    media:Media;
    properties:Properties;
}

export enum FlowPeriodicity{
    PerSecond,
    PerMinute,
    PerHour,
    PerDay,
    PerWeek
}
export interface ResourceAmount{
    resourceId:string;
    amount:number;
}
export interface ResourceFlow extends ResourceAmount{
    periodicity:FlowPeriodicity;
    last?:number;
}

// Unificamos structures+obstacles, no tiene sentido seguir teniendolos separados
export interface Placeable{
    id:string;
    type:'structure'|'obstacle';
    media:Media;
    properties:Properties;
    flows:ResourceFlow[]; // Estos flujos sirven para inicializar los flujos de las instancias de cada emplazable
    texture:Asset;
}

export interface Technology{
    id:string;
    media:Media;
    parent?:string;
    unlocks:string[];
    texture:Asset;
    properties:Properties;
}
export interface Cell{
    id:string;
    media:Media;
    texture:Asset;
    allowedPlaceableIds:string[];
    properties:Properties
}
export interface GameConfig{
    defaultPlayerProperties:Properties;
    unknownCellId:string;
}
export interface Game{
    id?:string
    media:Media;
    ownerId:string;
    cells:Cell[];
    technologies:Technology[];
    placeables:Placeable[];
    resources:Resource[];
    activities:Activity[];
    config:GameConfig;
}
export interface Stockpile{
    resourceId:string;
    amount:number;
    capacity?:number;
}

export interface InstancePlayer{
    instanceId:string; // Enlace bidireccional con la instancia
    media:Media;
    playerId:string;
    stockpiles:Stockpile[];
    technologies:string[];
    queue:EnqueuedActivity[];
    exploredCells?:number[];  // Lista de celdas exploradas
    cells:number[];
    properties:Properties;
}

export interface PlaceableInstance{
    id:number;
    placeableId:string;
    built:boolean;  // Determina si la instancia está en construcción o terminada
    instanceFlows:ResourceFlow[]; // Estos son copia de los originales. Ante una edición habrá que meterles mano!!
}
export interface CellInstance{
    id:number; // ID de instancia, número dentro del vector. Se crea una única vez
    cellId:string;
    playerId:string|null;
    placeables:PlaceableInstance[];
    position:Vector;
}
export interface GameInstance{
    id?:string
    size:number;
    gameId:string;
    players:InstancePlayer[];
    pendingTradingAgreements:TradingAgreement[];
    playerMessages:Message[];
    cells:CellInstance[];
    nextUUID:number; // Próximo identificador único
}
export interface Player{
    id?:string
    name:string;
    surname:string;
    email:string;
    password:string;
    birthDate:Date;
}
export interface User{
    id?:string
    name:string;
    surname:string;
    email:string;
    password:string;
    privileges:string[];
}

export enum MessageType{
    Unknown,
    Message,
    Notification,
    Report
}
export enum MessageContentType{
    None,                       // Sin contenido
    Plain,                      // Texto plano, mensajes
    TradeReport,                // Resumen del acuerdo comercial, con aceptación y cancelación para el jugador remoto
    AttackReport,               // Informe de ataque
    SpyReport                   // Informe de espionaje
}
export interface Message{
    id?:number;
    sendAt?:number; // Fecha de emision
    readedAt?: number|null; // Fecha de lectura
    senderName?:string; // Nombre del emisor
    type:MessageType; // Tipo de mensaje
    contentType:MessageContentType;
    srcPlayerId:string|null; // Emisor o null si el origen es la plataforma
    dstPlayerId:string; // Receptor
    subject: string; // Asunto
    message?: any; // Contenido
}

export interface SpyReport {
    success:boolean;
    probability:string;
    playerId?:string,
    playerName?:string,
    cells?:number;
    buildings?:number;
    technologies?:string[];
    stockpiles?:Stockpile[];
    properties?:Properties;
}

export interface TradingAgreement{
    id?:number;
    accepted?:boolean;
    srcPlayerId:string;
    dstPlayerId:string;
    offer:ResourceAmount[];
    request:ResourceAmount[];
}

export interface WorldMapQuery{
    p1:Vector;
    p2:Vector;
}

export interface WorldMapCell{
    position:Vector;
    cellId?:string;
    playerId?:string;
}

export interface WorldPlayer{
    media:Media;
    playerId:string;
    techLevel?:number;
    buildings?:number;
    stockpiles?:Stockpile[];
}
export interface WorldMapSector{
    width:number;
    height:number;
    map:WorldMapCell[];
    players:WorldPlayer[]
}

export const flowPeriodRanges = new Map<FlowPeriodicity,number>( [
    [FlowPeriodicity.PerSecond,1000],
    [FlowPeriodicity.PerMinute,60000],
    [FlowPeriodicity.PerHour,3600000],
    [FlowPeriodicity.PerDay,86400000],
    [FlowPeriodicity.PerWeek,604800000],
]);