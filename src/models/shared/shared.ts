import { Asset } from "./assets";

export class Info {
    constructor(private id: string, private name: string, private description: string, private icon: Asset, private image: Asset) { }

    getId(): string {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getDescription(): string {
        return this.description;
    }
    getIcon(): Asset {
        return this.icon;
    }
    getImage(): Asset {
        return this.image;
    }

    getPath() {
        throw new Error('getPath() must be overriden');
    }
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