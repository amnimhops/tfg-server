import { Asset } from "./assets";
import { Info } from "./shared";


export class Placeable extends Info{
    constructor(id:string,name:string,description:string,icon:Asset,image:Asset,private texture:Asset){
        super(id,name,description,icon,image);
    }
    getTexture():Asset{
        return this.texture;
    }
}

export class Obstacle extends Placeable{
    constructor(id:string,name:string,description:string,icon:Asset,image:Asset,texture:Asset){
        super(id,name,description,icon,image,texture);
    }
    getPath(){
        return `/world/placeables/obstacles/${this.getId()}`;
    }
}

export class Structure extends Placeable{
    constructor(id:string,name:string,description:string,icon:Asset,image:Asset,texture:Asset){
        super(id,name,description,icon,image,texture);
    }
    getPath(){
        return `/world/placeables/structures/${this.getId()}`;
    }
}

export class PlaceableInstance{
    constructor(private id:string,private placeable:Placeable){
        
    }
}

export function createPlaceable(data:any){

}