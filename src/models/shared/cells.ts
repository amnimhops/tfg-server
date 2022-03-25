import { Asset } from "./assets";
import { Info, Vector } from "./shared";
import { Placeable } from "./placeables";
import { InstancePlayer } from "./instances";

export class Cell extends Info{
    constructor(
        id:string,
        name:string,
        description:string,
        icon:Asset,
        image:Asset,
        private _texture:Asset,
        private _placeables:Placeable[]){
        super(id,name,description,icon,image);
    }
    
    get texture():Asset { return this._texture; }
    get placeables():Placeable[] { return this._placeables};
}

export class CellInstance{
    constructor(
        private _id:string, 
        private _cell:Cell,
        private _position:Vector,
        private _placeables:Placeable[],
        private _owner?:InstancePlayer,){}
    
    get id():string { return this._id; }
    get cell():Cell { return this._cell; }
    get position():Vector { return this._position; }
    get owner():InstancePlayer { return this._owner; }
    get placeables():Placeable[] { return this._placeables}    
    changeOwner(newOwner:InstancePlayer):void{
        this._owner = newOwner;
    }
}
