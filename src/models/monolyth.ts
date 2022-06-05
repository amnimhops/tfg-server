export type Link = {
    name:string;
    href:string;
}
export type WithToken<T> = T & {
    token:string;

}
export interface FontDef{
    name:string;
    style:string;
    file:string;
}

export interface Privilege{
    id:string;
    description:string;
}

export interface FileUpload{
    type:string;
    data:any;
}

export const Privileges:Record<string,Privilege> = {
    Play:{id:'play',description:'Participar en un juego'},
    /* Permisos CRUD en backoffice, combinaciones de sección/acción */
    UseBackoffice:{id:'bo-use',description:'Acceder al backoffice'},
    AddUser:{id:'bo-users-add',description:'Crear usuarios'},
    EditUser:{id:'bo-users-edit',description:'Editar usuarios'},
    ViewUser:{id:'bo-users-view',description:'Ver usuarios'},
    DeleteUser:{id:'bo-users-delete',description:'Borrar usuarios'},
    ListUsers:{id:'bo-users-list',description:'Buscar usuarios'},
    BanUser:{id:'bo-users-ban',description:'Banear usuarios'},
    AddGame:{id:'bo-games-add',description:'Crear juegos'},
    EditGame:{id:'bo-games-edit',description:'Editar juegos'},
    DeleteGame:{id:'bo-games-edit',description:'Borrar juegos'},
    ViewGame:{id:'bo-games-view',description:'Ver fichas de juegos'},
    ListGames:{id:'bo-games-list',description:'Consultar juegos'},
    AddInstance:{id:'bo-instances-add',description:'Crear instancias'},
    EditInstance:{id:'bo-instances-edit',description:'Editar instancias'},
    ListInstances:{id:'bo-instances-list',description:'Buscar instancias'},
    ViewInstances:{id:'bo-instances-view',description:'Ver datos de instancias'},
    DeleteInstances:{id:'bo-instances-list',description:'Borrar instancias'},
    EditOwnedGames:{id:'bo-games-edit-own-game',description:'Editar juegos de los que es propietario'}
}

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
    PlayerPropertiesUpdated:'player_properties_updated',
    InfluenceRadiusUpdated:'influence_radius_updated',
    Timer:'timer'
}

export type WithAmount<T> = T & {
    amount:number;
}

export interface RegistrationRequest{
    user:User;          // Este se mandará al servicio de usuarios
    avatar:FileUpload|null;  // Este se mandará al servicio de subidas
}

export const ConstantProperties = {
    QueueCapacity:'queueCapacity',
    QueueNumProcesses:'queueNumProcesses',
    SpySucceed:'spySucceed',
    SpyAvoid:'spyAvoid',
    Attack:'attack',
    Defence:'defence',
    ProductionMultiplier:'productionMultiplier',
    Health:'health',
    Luck:'luck',
    Indestructible:'indestructible',
    TransportCapacity:'transportCapacity',
    InfluenceRadius:'influenceRadius',
    Weight:'weight',
    EnhancedResearch:'enhancedResearch',
    EnhancedBuild:'enhancedBuild',
    EnhancedAttack:'enhancedAttack'
};

export type PropDesc = {
    prop:string;
    text:string;
    type:'number'|'boolean'|'text'
}

export const PropertyDescriptions:PropDesc[] = [
    {prop:ConstantProperties.QueueCapacity,text:"Capacidad de la cola, determina el máximo número de actividades que se pueden encolar.",type:'number'},
    {prop:ConstantProperties.QueueNumProcesses,text:"Tareas en paralelo, determina el número de actividades en cola que se pueden ejecutar a la vez.",type:'number'},
    {prop:ConstantProperties.SpySucceed,text:"Espionaje, determina la probabilidad de éxito en una misión de espionaje",type:'number'},
    {prop:ConstantProperties.SpyAvoid,text:"Evasión, determina la capacidad de evadir una misión de espionaje.",type:'number'},
    {prop:ConstantProperties.Attack,text:"Capacidad ofensiva, determina la cantidad de daño que efectua la unidad en cada asalto.",type:'number'},
    {prop:ConstantProperties.Defence,text:"Capacidad defensiva, determina cuanto daño es capaz de absorber en cada ataque.",type:'number'},
    {prop:ConstantProperties.ProductionMultiplier,text:"Factor multiplicador a los recursos producidos en esta celda",type:'number'},
    {prop:ConstantProperties.Health,text:"Puntos de vida, determina el aguante de la unidad",type:'number'},
    {prop:ConstantProperties.Luck,text:"Suerte, determina en un ataque quién ataca o defiende primero (unidad y jugador)",type:'number'},
    {prop:ConstantProperties.Indestructible,text:"Determina si la estructura puede ser destruida en un ataque",type:'boolean'},
    {prop:ConstantProperties.TransportCapacity,text:"Capacidad de carga de la unidad, determina cuanto botín se puede cargar en una ofensiva exitosa",type:'number'},
    {prop:ConstantProperties.InfluenceRadius,text:"Radio de influencia del jugador (acumulativo), determina el número de celdas a su alrededor con las que puede interactuar",type:'number'},
    {prop:ConstantProperties.Weight,text:"Masa de la unidad, determina el peso en la carga. En caso de un ataque exitoso determina el peso máximo que puede transportar. En combinación con la capacidad de carga determina la recompensa.",type:'number'},
    {prop:ConstantProperties.EnhancedResearch,text:"Factor multiplicador a los costes de investigación. Cuanto más alto más coste, cuanto mas bajo, menor coste y duración (en tanto por uno)",type:'number'},
    {prop:ConstantProperties.EnhancedBuild,text:"Factor multiplicador a los costes de construcción. Cuanto más alto más coste, cuanto mas bajo, menor coste y duración (en tanto por uno)",type:'number'},
    {prop:ConstantProperties.EnhancedAttack,text:"Factor multiplicador a los costes de ataque. Cuanto más alto más coste, cuanto mas bajo, menor coste y duración (en tanto por uno)",type:'number'},
]

export const CellProperties = [
    ConstantProperties.ProductionMultiplier
]

export const PlayerProperties = [
    ConstantProperties.QueueCapacity,
    ConstantProperties.QueueNumProcesses,
    ConstantProperties.SpySucceed,
    ConstantProperties.SpyAvoid,
    ConstantProperties.Luck,
    ConstantProperties.InfluenceRadius
]

export const TechnologyProperties = [
    ConstantProperties.QueueCapacity,
    ConstantProperties.QueueNumProcesses,
    ConstantProperties.SpySucceed,
    ConstantProperties.SpyAvoid,
    ConstantProperties.Attack,
    ConstantProperties.Defence,
    ConstantProperties.Luck,
    ConstantProperties.TransportCapacity,
    ConstantProperties.InfluenceRadius,
    ConstantProperties.Weight
]

export const ResourceProperties = [
    ConstantProperties.SpyAvoid,
    ConstantProperties.Attack,
    ConstantProperties.Defence,
    ConstantProperties.Health,
    ConstantProperties.Luck,
    ConstantProperties.TransportCapacity,
    ConstantProperties.InfluenceRadius,
    ConstantProperties.Weight

]
/*
export const ActivityPropertyMap : Map<ActivityType,string[]> = new Map([
    [ActivityType.Attack,[]]
])*/
export interface PasswordRecoveryRequest{
    id?:string; // Unique, actuará como token
    email:string;
    requestDate:Date;
}

export interface LoginRequest{
    email:string;
    password:string;
}

/**
 * Parámetros generales de búsqueda
 */
export interface SearchParams{
    /**
     * Página actual
     */
    page?:number;
    /**
     * Número de registros por página
     */
    records?:number;
    /**
     * Criterios de búsqueda
     */
    criteria:any;
    /**
     * Campo por el que se ordenará
     */
    sortField?:string;
    /**
     * Dirección del ordenamiento
     */
    sortOrder?:1|-1;
    /**
     * Atributo que determina qué campos deben
     * devolverse en el resultado.
     */
    fields?:Record<string,any>;
}
export interface SearchResult<T>{
    /**
     * Numero de elementos encontrados
     */
    count:number;
    /**
     * Página actual de resultados
     */
    page:number;
    /**
     * Número de paginas de resultados
     */
    pages:number;
    /**
     * Resultados de esta página
     */
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
    uiControlBackgroundColorBrilliant:string;
    uiControlForegroundColor:string;
    uiControlFontColor:string;
    /*uiControlFontColorDanger:string;*/
    uiControlFontColorDisabled:string;
    uiControlTextSize:string;
    uiControlTextHeadingSize:string;
    uiControlShadowColor:string;
    uiControlPadding:string;
    uiControlBorderColor:string;
    uiControlBorderRadius:string;
    uiControlBackgroundPrimary:string;
    uiControlBackgroundSecondary:string;
    uiSuccess:string;
    uiWarning:string;
    uiDanger:string;
    uiResourceFlowPositive:string;
    uiResourceFlowNegative:string;
}
export interface TileConfig{
    width:number;
    height:number;
    xOffset:number;
    yOffset:number
}
export interface UserInterface{
    /** Configuración CSS de la interfaz */
    style:UIConfig;
    /** Propiedades gráficas de los mapas enlosables */
    tiles:TileConfig; 
    /** Recursos gráficos de la interfaz */
    uiAssets:Record<string,Asset>;
}
export interface Asset{
    id:string;
    url:string;
    type:'image'|'sound'|'text'|'json'|'style';
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
export type Properties = Record<string,number>;

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
    requiredTech?:string;
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

export const PlaceableProperties = [
    ConstantProperties.Indestructible,
    ConstantProperties.InfluenceRadius,
    ConstantProperties.Defence,
    ConstantProperties.Health,
    ConstantProperties.QueueCapacity,
    ConstantProperties.SpyAvoid
]
// Unificamos structures+obstacles, no tiene sentido seguir teniendolos separados
export interface Placeable{
    /**Identificador de la estructura */
    id:string;
    /** Tipo (estructura u obstaculo) */
    type:'structure'|'obstacle';
    /** Info multimedia */
    media:Media;
    /** Propiedades asociadas a la estructura */
    properties:Properties;
    /** Flujos de producción y mantenimiento de recursos */
    flows:ResourceFlow[]; // Estos flujos sirven para inicializar los flujos de las instancias de cada emplazable
    /** Textura usada para pintar en el mapa del jugador */
    texture:Asset;
    /** Tecnología necesaria para construir */
    requiredTech?:string;
    /** Costes de construcción */
    buildExpenses?:ResourceAmount[];
    /** Tiempo de construccion */
    duration:number;
}

export interface Technology{
    id:string;
    media:Media;
    parent?:string;
    unlocks:string[];
    texture:Asset;
    duration:number;
    properties:Properties;
    expenses:ResourceAmount[];
}
export interface Cell{
    id:string;
    media:Media;
    texture:Asset;
    color:string;
    probability:number;
    allowedPlaceableIds:string[];
    properties:Properties
}
export interface SectionConfig{
    name:string;
    icon:Asset;
}
export interface GameConfig{
    defaultPlayerProperties:Properties;
    unknownCellId:string;
}
export interface GameRating{
    score:number;
    votes:number;
}
export interface GameStats{
    instances:number;
    players:number;
    maxPlayers:number;
    connectedPlayers:number;
    cells:number;
    resources:number;
    placeables:number;
    technologies:number;
}
export interface Game{
    id?:string
    media:Media;
    gallery?:Asset[];
    userInterface?:UserInterface;
    ownerId:string;
    cells:Cell[];
    technologies:Technology[];
    placeables:Placeable[];
    resources:Resource[];
    activities:Activity[];
    rating?:GameRating;
    config:GameConfig;
    defaultPlayerStockpiles:ResourceAmount[];
}
export interface Stockpile{
    resourceId:string;
    amount:number;
    capacity?:number;
}

export interface InstancePlayerInfo{
    gameId:string;

    /**
     * TODO Aqui se puedne meter muchos mas datos
     * - Recursos acumulados (nombre/imagen/cantidad)
     * - Tec. investigadas,
     * - etc.
     */
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

export interface LivegameInstanceSummary{
    uptime:number;
    connectedPlayers:number;
}
/**
 * Esta interfaz está pensada para las búsquedas de instancias,
 * devuelve un tipo compatible con GameInstance, pero sin tener
 * que arrastrar todas sus cositas.
 */
export interface GameInstanceSummary extends Partial<GameInstance>{
    id:string;
    size:number;
    gameId:string;
    gameName:string;
    numPlayers:number;
    liveData?:LivegameInstanceSummary;
}
export interface GameInstance{
    id?:string
    size:number;
    maxPlayers:number;
    gameId:string;
    players:InstancePlayer[];
    pendingTradingAgreements:TradingAgreement[];
    playerMessages:Message[];
    cells:CellInstance[];
    nextUUID:number; // Próximo identificador único
}

export interface User{
    id?:string;
    name:string;
    surname:string;
    email:string;
    password:string;
    privileges:string[];
    nickname?:string;
    portrait?:Asset;
    bannedUntil?:Date;
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
    color:string;
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