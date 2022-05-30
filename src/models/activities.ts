import { countdown, countdownStr } from "./functions";
import { GameData } from "./gamedata";
import { Activity, ActivityTarget, ActivityType, ConstantProperties, InstancePlayer, Placeable, Properties, ResourceAmount, Technology } from "./monolyth";
import { cloneAmounts, combineAmounts, scaleAmounts } from "./resources";

export interface ActivityCost{
    /** Cantidad de recursos que cuesta la combinación de actividad/target */
    resources:ResourceAmount[];
    /** El coste temporal, en segundos */
    time:number;
    /** 
     * La duración es la representación textual del coste temporal,  
     * solo sirve para facilitar la labor al cliente web.
     */
    duration?:string;
}

/**
 * Datos de entrada del modal de confirmación de actividad
 */
export interface ActivityConfirmationModel{
    title:string;
    activityInfo:ActivityInfo;
}
/**
 * Interfaz empleada para suministrar información al
 * control que determina si una actividad puede llevarse
 * a cabo.
 */
export interface ActivityInfo{
    type:ActivityType;
    target:ActivityTarget;
}

export interface ActivityAvailability{
    available:boolean;
    type:ActivityType;
    target?:ActivityTarget;
    info:string[];
}

/**
 * Esta interfaz representa la información asociada a una
 * actividad de construcción de emplazables en una celda.
 */
export interface BuildingActivityTarget extends ActivityTarget{
    /**
     * Índice de la celda dentro de su instancia
     */
    cellInstanceId:number;
    /**
     * Identificador (que no indice) de la instancia del emplazable dentro de la celda.
     * Se usa un identificador en lugar de un índice porque, al contrario que las instancias
     * de las celdas, los emplazables varían a lo largo del ciclo de vida de la aplicación. Si
     * esta interfaz apunta a un índice concreto y mientras se construye se desmantela otro
     * emplazable, crearía inconsistencia en los datos.
     */
    placeableInstanceId:number|null;
    /**
     * Identificador del emplazable que se construye
     */
    placeableId:string;
}

export interface ResearchActivityTarget extends ActivityTarget{
    techId:string;
}

export interface DismantlingActivityTarget extends ActivityTarget{
    cellInstanceId:number;
    placeableInstanceId:number;
}

export interface SpyActivityTarget extends ActivityTarget{
    instancePlayerId:string;
}
export interface AttackActivityTarget extends ActivityTarget{
    instancePlayerId:string;
    resources:ResourceAmount[];
}
export interface TradingActivityTarget extends ActivityTarget{
    instancePlayerId:string;
    send:ResourceAmount[];
    receive:ResourceAmount[];
}
export interface ExplorationActivityTarget extends ActivityTarget{
    cellInstanceId:number;
}
export interface ClaimActivityTarget extends ActivityTarget{
    cellInstanceId:number;
}

/**
 * Obtiene el coste de investigación de una tecnología:
 * - El coste en recursos es la suma de los costes de la actividad y el target
 * - La duración surge de la duración de la tecnología * la duración de la actividad
 * @param activity 
 * @param tech 
 * @param target 
 */
function getResearchCost(props:Properties,activity:Activity,tech:Technology):ActivityCost{
    // Vamos a efectuar modificaciones sobre los costes
    // asi que es necesario crear copias de los originales!
    const enhancedResearch = props[ConstantProperties.EnhancedResearch] || 1;
    const techExpenses = cloneAmounts(tech.expenses);
    const activityExpenses = cloneAmounts(activity.expenses);
    
    const resources = scaleAmounts(enhancedResearch,combineAmounts([...techExpenses,...activityExpenses]));
    const time = 1000 * activity.duration * tech.duration * enhancedResearch; // Milisegundos!

    return { resources, time }
}

function getBuildingCost(props:Properties,activity:Activity, placeable:Placeable):ActivityCost{
    // Vamos a efectuar modificaciones sobre los costes
    // asi que es necesario crear copias de los originales!
    const enhancedBuild = props[ConstantProperties.EnhancedBuild] || 1;
    const buildingExpenses = cloneAmounts(placeable.buildExpenses||[]);
    const activityExpenses = cloneAmounts(activity.expenses);
    
    const resources = scaleAmounts(enhancedBuild,combineAmounts([...buildingExpenses,...activityExpenses]));
    const time = 1000 * activity.duration * placeable.duration * enhancedBuild; // Milisegundos!

    return { resources, time }
}

/**
 * Calcula los costes de una actividad de ataque
 * @param props Propiedades acumuladas del jugador atacante
 * @param activity ACtivitidad que se lleva a cabo (Attack)
 * @param attack Target con los datos del ataque
 * @returns El coste de la actividad
 */
function getAttackCost(props:Properties,activity:Activity,attack:AttackActivityTarget): ActivityCost{
    const enhancedAttack = props[ConstantProperties.EnhancedAttack] || 1;
    const activityExpenses = cloneAmounts(activity.expenses);
    const attackExpenses = cloneAmounts(attack.resources)

    // TODO Esta función se puede mejorar bastante incluyendo los datos
    // del jugador enemigo (distancia, defensa, etc), pero en algún punto
    // hay que parar.
    const resources = combineAmounts([...scaleAmounts(enhancedAttack,activityExpenses),...attackExpenses]);
    const time = 1000 * activity.duration * enhancedAttack; // Michisegundos!

    return {resources,time};
}

export function activityCostCalculator(props:Properties,gamedex:GameData, type:ActivityType, target:ActivityTarget) {
    let cost : ActivityCost|null = null;
    
    const activity = gamedex.activities.get(type)!; // El linter de vue se queja por esto, en fin.
    
    if(type == ActivityType.Research){
        const tech = gamedex.technologies[(target as ResearchActivityTarget).techId];
        cost = getResearchCost(props,activity,tech);
    }else if(type == ActivityType.Build){
        const placeable = gamedex.placeables[(target as BuildingActivityTarget).placeableId];
        cost = getBuildingCost(props,activity,placeable);
    }else if(type == ActivityType.Attack){
        const attack = target as AttackActivityTarget;
        cost = getAttackCost(props,activity,attack);
    }else{
        // Cualquier otra actividad tiene el coste normal asociado
        cost = {
            resources: cloneAmounts(activity.expenses),
            time: activity.duration * 1000
        }
    }

    // Termiamos calculando la etiqueta de la duración
    const now = Date.now();
    
    cost.duration = countdownStr(countdown(now,now + cost.time));

    return cost;
}