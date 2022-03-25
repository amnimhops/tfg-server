import { CellInstance } from "./cells";
import { Player } from "./players";
import { Stockpile } from "./resources";
import { WorldDescriptor } from "./world";

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

}