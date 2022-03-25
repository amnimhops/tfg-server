import { Asset } from "./assets";
import { Info, Vector } from "./shared";
import { Placeable, PlaceableInstance } from "./placeables";

export class Cell extends Info{
    constructor(id:string,name:string,description:string,icon:Asset,image:Asset,private texture:Asset,private placeables:Placeable[]){
        super(id,name,description,icon,image);
    }

    getPlaceables():Placeable[]{
        return this.placeables;
    }
    getTexture():Asset{
        return this.texture;
    }
    getPath(){
        return `/world/cells/${this.getId()}`;
    }
}

export class CellInstance{
    constructor(private cell:Cell,private position:Vector,private placeables:PlaceableInstance[]){}
    getCell():Cell{
        return this.cell;
    }
    getPosition():Vector{
        return this.position;
    }
    getPlaceables():PlaceableInstance[]{
        return this.placeables;
    }
}
/*
export function createCell(data:any){
    return new Cell(
        data.id||'',
        data.name||'',
        data.description||'',
        Asset.createAsset(data.icon||{}),
        Asset.createAsset(data.image||{}),
        Asset.createAsset(data.texture||{}),
        data.placeables ? data.placeables.map( placeable => createPlaceable(placeable)) : []
    );
}

export function createCellInstance(){

}*/
