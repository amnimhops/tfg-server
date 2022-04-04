import { CellInstance } from "./cells";
import { Structure } from "./placeables";
import { Player } from "./players";
import { FlowPeriodicity, Stockpile } from "./resources";
import { WorldDescriptor } from "./world";

const PROCESS_INTERVAL = 1000;

export class InstancePlayer {
    constructor(
        private _player: Player,
        private _stockpiles: Record<string, Stockpile>,
        private _cells: Record<string, CellInstance> = {}) { }

    get player(): Player { return this._player; }
    get stockpiles(): Record<string, Stockpile> { return this._stockpiles; }
    get cells(): Record<string, CellInstance> { return this._cells }
    addCell(cell: CellInstance) {
        this._cells[cell.id] = cell;
        cell.changeOwner(this);
    }
}

export class GameInstance {
    private _timerId:NodeJS.Timer;

    constructor(
        private _id: string | null,
        private _world: WorldDescriptor,
        private _map: Record<string, CellInstance>,
        private _players: Record<string, InstancePlayer>) { }

    get id(): string { return this._id; }
    set id(id: string) { this._id = id; }
    get worldDescriptor() { return this._world; }
    get map() { return this._map; }
    get players() { return this._players; }

    start():void{
        if(this._timerId) throw new Error('La instancia ya está iniciada');

        this._timerId = setInterval(this.process.bind(this),PROCESS_INTERVAL);
    }

    process():void{
        const t0 = Date.now();

        /**
         * ¿Tiene sentido esta tarea? ¿No sería mejor que cada elemento se procese a si mismo?
         * En cualquier caso, los procesos son:
         * 1.- Mover todos los flujos de recursos desde los origenes hacia los destinos
         * 2.- Comprobar las colas, activar los tiempos
         */
        let totalResources = 0;
        for(const cellId in this._map){
            const cell = this._map[cellId];
            if(cell.owner){
                // Procesar solo celdas con propietario
                const player:InstancePlayer = cell.owner;
                
                for(const placeable of cell.placeables){
                    // Solo las estructuras tienen flujos
                    if(placeable instanceof Structure){
                        for(const flow of placeable.flows){
                            const target = player.stockpiles[flow.resource.id];
                            const amount = flow.flow();
                            target.add(amount);
                            totalResources += amount;
                            //if(amount > 0) console.log(player.player.name,target.resource.media.name,amount);
                        }
                    }
                }
            }
        }

        console.log('Instance processed in',Date.now()-t0,'. Resources collected =',totalResources);
    }
}