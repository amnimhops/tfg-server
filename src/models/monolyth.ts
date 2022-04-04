export interface SearchResult<T>{
    count:number;
    page:number;
    pages:number;
    results:T[];
}
type Pagination = {
    page:number;
    itemsPerPage:number;
}
type Sorting = {
    field:string;
    dir:'asc'|'desc';
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

export interface Asset{
    id:string;
    url:string;
    type:'image'|'sound'|'text';
    data?:any
}
export interface Media{
    name: string;
    description: string;
    icon: Asset;
    thumbnail: Asset;
    image: Asset;
}
export interface Properties extends Record<string,any>{
    
}
export interface Resource{
    id:string;
    media:Media;
    props?:Properties;
}
export enum FlowPeriodicity{
    Once,
    PerSecond,
    PerMinute,
    PerHour,
    PerDay,
    PerWeek
}
export interface ResourceFlow{
    resourceId:string;
    amount:number;
    periodicity:FlowPeriodicity;
}
export interface Placeable{
    id:string;
    media:Media;
    props?:Properties;
    texture:Asset;
}
export interface Structure extends Placeable{
    flows: ResourceFlow[];
}
export interface Obstacle extends Placeable{

}
export interface Technology{
    id:string;
    media:Media;
}
export interface Cell{
    id:string;
    media:Media;
    texture:Asset;
    allowedPlaceableIds:string[];
}
export interface Game{
    id?:string
    media:Media;
    ownerId:string;
    cells:Cell[];
    technologies:Technology[];
    placeables:Placeable[];
    resources:Resource[];
}
export interface Stockpile{
    resourceId:string;
    amount:number;
    capacity?:number;
}
export interface InstancePlayer{
    playerId:string;
    stockpiles:Stockpile[];
}
export interface CellInstance{
    cellId:string;
    playerId:string;
    placeableIds:string[];
    position:Vector;
}
export interface GameInstance{
    id?:string
    gameId:string;
    players:InstancePlayer[];
    cells:CellInstance[];
}
export interface Player{
    id?:string
    name:string;
    surname:string;
    email:string;
    password:string;
    birthDate:Date;
}
export interface User{
    id?:string
    name:string;
    surname:string;
    email:string;
    password:string;
    privileges:string[];
}
