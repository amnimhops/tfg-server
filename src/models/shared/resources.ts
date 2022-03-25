import { Asset } from "./assets";
import { Info } from "./shared";


export class Resource extends Info{
    constructor(
        id:string,
        name:string,
        description:string,
        icon:Asset,
        image:Asset){
        super(id,name,description,icon,image);
    }
}

export class Stockpile{
    constructor(
        private _resource:Resource, 
        private _amount:number){
    }
    get resource():Resource { return this._resource; }
    get amount():number { return this._amount; }
    add(amount:number){ this._amount+=amount };
}

export class ResourceFlow{

}