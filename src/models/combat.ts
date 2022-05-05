import { randomItem } from "./functions";
import { ConstantProperties,InstancePlayer,Properties, ResourceAmount } from "./monolyth";


interface CombatUnitStrike{
    attackerId:string;
    defenderId:string;
    damage:number;
    defence:number;
    casualties:number;
}
interface CombatUnitReport{
    strikes:CombatUnitStrike[];
}
interface CombatRoundReport{
    unitCombat:CombatUnitReport[];
}
export enum CombatResult {
    AttackerWin,
    Tie,
    DefenderWin
}
export interface CombatReport{
    attackerDestroyedResources:ResourceAmount[];
    defenderDestroyedResources:ResourceAmount[];
    defenderDestroyedPlaceables:{id:string,amount:number}[];
    rounds:CombatRoundReport[]
    attackerTransportCapacity:number;
    attacker:CombatPlayer
    defender:CombatPlayer
    result:CombatResult
}

export interface SimplifiedCombatSummary {
    attackerResourceCasualties:ResourceAmount[];
    defenderPlaceableCasualties:Record<string,number>;
    defenderResourceCasualties:ResourceAmount[];
    rounds:number;
    warSpoil:ResourceAmount[];
}

export function createCombatSummary(fullReport:CombatReport,reward:ResourceAmount[]) : SimplifiedCombatSummary{
    const summary : SimplifiedCombatSummary = {
        attackerResourceCasualties:[],
        defenderPlaceableCasualties:{},
        defenderResourceCasualties:[],
        rounds:fullReport.rounds.length,
        warSpoil:reward
    }
    summary.attackerResourceCasualties = fullReport.attacker.casualties.map( cu => ({amount:cu.startingUnits,resourceId:cu.id}));
    summary.defenderResourceCasualties = fullReport.defender.casualties
        .filter( cu => cu.type == 'resource') 
        .map( cu => ({amount:cu.startingUnits,resourceId:cu.id}));

    fullReport.defender.casualties.filter( cu => cu.type == 'placeable').forEach( cu=> {
        summary.defenderPlaceableCasualties[cu.id] = cu.startingUnits;
    });

    return summary;
}

class CalculatedProperties{

    constructor(private props:Properties){

    }
    get(key:string):number{
        return this.props[key]||0;
    }
}
export interface CombatUnitInfo{
    id:string,
    type:'resource'|'placeable',
    props:Properties,
    amount:number
}
export class CombatUnit{
    properties:CalculatedProperties;
    id:string;
    luck:number;
    type:string;
    startingUnits:number;
    private _unitaryHealth:number
    private _attack:number;
    private _defence:number;
    private _capacity:number;
    health:number;
    
    constructor( {id,type,props,amount} : CombatUnitInfo){
        /**
         * Cuando se mandan contingentes con miles o cientos de miles de
         * recursos, los bucles anidados se pueden ir de madre. Para evitar
         * colapsar el hilo de ejecución de node, cada recurso representa
         * a todas sus unidades. Por ejemplo, si se mandan 100 tanques, el
         * efecto es que hay un único tanque con la fuerza, defensa y salud
         * combinado de todos ellos.
         */
        this.id = id;
        this.type = type;
        this.properties = new CalculatedProperties(props);
        this.startingUnits = amount;
        this.luck = this.properties.get(ConstantProperties.Luck);
        this._attack = this.properties.get(ConstantProperties.Attack);
        this._defence = this.properties.get(ConstantProperties.Defence);
        this._unitaryHealth = this.properties.get(ConstantProperties.Health) || 1;
        this._capacity = this.properties.get(ConstantProperties.TransportCapacity) || 1;
        this.health = this._unitaryHealth * amount;
        
    }
    get attack():number { return this._attack * this.amount }
    get defence():number { return this._defence * this.amount }
    get amount():number { return this.health/this._unitaryHealth; }
    get capacity():number { return this._capacity * this.amount;}
    get casualties():number { return this.startingUnits - this.amount}

    combat(enemy:CombatUnit):CombatUnitReport{
        const report:CombatUnitReport = {
            strikes:[]
        }
        /**
         * La suerte determina el orden de ataque, pero en igualdad de 
         * condiciones la unidad this inicia la acción.
         */
        let [a,b] = this.luck >= enemy.luck ? [this,enemy] : [enemy,this]; 
        
        // Ciclo ataque/contraataque
        for(let i = 0; i < 2; i++){
            const startingUnits = [a.amount,b.amount];
            const damage = Math.max(a.attack - b.defence,0); // Una defensa mayor que un ataque daría un daño negativo...
            b.health = Math.max(0,b.health - damage);
            const casualties = startingUnits[1] - b.amount;
            report.strikes.push({attackerId:a.id,defenderId:b.id,damage,defence:b.defence,casualties});
            [a,b] = [b,a]; // Invertimos las tornas
        }
       
        return report;
    }
}
export class CombatPlayer{
    units:CombatUnit[];
    casualties:CombatUnit[];
    props:CalculatedProperties;
    luck:number;
    constructor(player:InstancePlayer,properties:Properties,contingent:CombatUnit[]){
        this.props = new CalculatedProperties(properties);
        this.units = contingent;
        this.casualties = [];
        this.luck = this.props.get(ConstantProperties.Luck);
    }
    /**
     * Mueve todas las unidades cantidad 0 a la lista de bajas
     */
    updateCasualties(){
        this.casualties.push(...this.units.filter( unit => unit.amount == 0));
        this.units = this.units.filter( unit => unit.amount > 0);
    }
    attack(defender: CombatPlayer): CombatReport {
        // Se tendrá en cuenta el contraste de fuerzas entre ambos contrincantes
        let [next,prev] = (this.luck >= defender.luck) ? [this,defender] :  [defender,this];
        let stopBattle = false
        const roundReports:CombatRoundReport[] = [];
        
        while(this.remainingUnits > 0 && defender.remainingUnits > 0 && !stopBattle){
            const unitCombat = [];
            let roundDamage = 0;
            for(const unit of next.units){
                // Es posible que el combate de la unidad anterior haya agotado al último enemigo
                if(prev.units.length > 0){ 
                    const opponentUnit = randomItem(prev.units);
                    const report = unit.combat(opponentUnit);
                    roundDamage += report.strikes[0].damage + report.strikes[1].damage;
                    unitCombat.push(report);
                    next.updateCasualties();
                    prev.updateCasualties();
                }
            }

            if(roundDamage == 0){
                /**
                 * Dos jugadores sin capacidad ofensiva crearían un bucle infinito.
                 */
                stopBattle = true;
            }
            // Siguiente ronda a la inversa
            [prev,next] = [next,prev];

            // Añadir al informe de ronda
            roundReports.push({unitCombat});
        }

        const result = stopBattle ? CombatResult.Tie : (this.remainingUnits > 0 && defender.remainingUnits == 0 ? CombatResult.AttackerWin : CombatResult.DefenderWin);
       
        // Se recopilan los recursos destruidos del atacante
        const attackerDestroyedResources:ResourceAmount[] = this.casualties.map(cu => ({amount:cu.amount,resourceId:cu.id}))
        // Se añaden las bajas de los recursos aun activos
        attackerDestroyedResources.push(
            ...this.units.filter(cu=>cu.casualties > 0).map(cu=>({resourceId:cu.id,amount:cu.amount}))
        );
        // Se recopilan los recursos destruidos del defensor
        const defenderDestroyedResources:ResourceAmount[] = defender.casualties
            .filter(cu => cu.type == 'resource')
            .map(cu => ({amount:cu.amount,resourceId:cu.id}))
        // Se añaden las bajas de los recursos aun activos
        defenderDestroyedResources.push(
            ...defender.units
                .filter(cu=>cu.casualties > 0 && cu.type == 'resource')
                .map(cu=>({resourceId:cu.id,amount:cu.amount}))
        );
        // Se recopilan los edificios destruidos durante el ataque
        // Se recopilan los recursos destruidos del defensor
        const defenderDestroyedPlaceables:{id:string,amount:number}[] = defender.casualties
            .filter(cu => cu.type == 'placeable')
            .map(cu => ({amount:cu.amount,id:cu.id}))
        // Se añaden las bajas de los edificios aun activos
        defenderDestroyedPlaceables.push(
            ...defender.units
                .filter(cu=>cu.casualties > 0 && cu.type == 'placeable')
                .map(cu=>({id:cu.id,amount:cu.amount}))
        );

        // Por ultimo, se determina la capacidad de carga del atacante para transportar
        // el botín teniendo en cuenta la capacidad de cada recurso superviviente.
        const capacity = this.units
            .map( cu => cu.amount * (cu.properties.get(ConstantProperties.TransportCapacity)))
            .reduce( (prev,current) => prev+current, 0);

        // Se genera el informe final con los datos que la api necesita para continuar
        const combatReport:CombatReport = {
            attackerDestroyedResources,
            defenderDestroyedResources,
            defenderDestroyedPlaceables,
            rounds:roundReports,
            attackerTransportCapacity:capacity,
            attacker:this,
            defender,
            result
        }
        return combatReport;
    }
    get remainingUnits():number {
        let count = 0;
        for(let i = 0; i < this.units.length; i++){
            count += this.units[i].amount;
        }
        return count;
    }
}