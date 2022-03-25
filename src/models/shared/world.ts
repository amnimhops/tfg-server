import { Cell } from "./cells";
import { Placeable  } from "./placeables";
import { Resource } from "./resources";

export class WorldDescriptor{
    constructor(
        private _id:string,
        private _resources:Record<string,Resource>,
        private _placeables:Record<string,Placeable>,
        private _cells:Record<string,Cell>
    ){}
    get id():string { return this._id; }
    get resources():Record<string,Resource> { return this._resources; }
    get placeables():Record<string,Placeable> { return this._placeables; }
    get cells():Record<string,Cell> { return this._cells; }
}