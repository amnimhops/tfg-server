import { CellInstance } from "./cells";

export class Player {
    constructor(private id: string, private name: string, private cells: CellInstance[]) {

    }

    getId(): string { return this.id }
    getName(): string { return this.name}
    getCells(): CellInstance[] {return this.cells}
}
/*
export function createPlayer(data:any){
    return new Player(
        data.id||null,
        data.name||'',
        data.cells ? data.cells.map( cellInstance => createCellInstance(cellInstance)) : []
    );
}*/