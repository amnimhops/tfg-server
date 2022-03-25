import { Asset } from "./assets";

export class Info {
    constructor(
        private _id: string, 
        private _name: string, 
        private _description: string, 
        private _icon: Asset, 
        private _image: Asset) { }

    get id():string { return this._id;}
    get name():string { return this._name;}
    get description():string { return this._description;}
    get icon():Asset { return this._icon;}
    get image():Asset { return this._image;}  
}

export class Vector{
    constructor(public x:number = 0, public y :number = 0){}
    add(vector:Vector):Vector{
        this.x+=vector.x;
        this.y+=vector.y;
        return this;
    }
    sub(vector:Vector):Vector{
        this.x-=vector.x;
        this.y-=vector.y;

        return this;
    }
    zero():Vector{
        this.x = 0;
        this.y = 0;
        return this;
    }
    distance(vector:Vector):number{
        return Math.sqrt((vector.y - this.y)*(vector.y - this.y ) + (vector.x - this.x ) * (vector.x - this.x));
    }
}