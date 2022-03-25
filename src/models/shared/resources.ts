import { Asset } from "./assets";
import { Info } from "./shared";


export class Resource extends Info{
    constructor(id:string,name:string,description:string,icon:Asset,image:Asset){
        super(id,name,description,icon,image);
    }
    getPath(){
        return `/world/resources/${this.getId()}`;
    }
}

export class Stockpile{
    constructor(private resource:Resource, public amount:number){
    }
    getResource():Resource{
        return this.resource;
    }
}

export class ResourceFlow{

}