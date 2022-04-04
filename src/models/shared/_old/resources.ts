import { once } from "events";
import { Asset } from "./assets";
import { Media } from "./shared";

export class Resource {
    constructor(
        private _id: string,
        private _media: Media) { }

    get id(): string { return this._id; }
    get media(): Media { return this._media };
}

export class Stockpile {
    constructor(
        private _resource: Resource,
        private _amount: number) {
    }
    get resource(): Resource { return this._resource; }
    get amount(): number { return this._amount; }
    add(amount: number) { this._amount += amount };
}

export enum FlowPeriodicity{
    Once,
    PerSecond,
    PerMinute,
    PerHour,
    PerDay,
    PerWeek
}


const periodDuration:Map<FlowPeriodicity,number> = new Map(
    [
        [FlowPeriodicity.Once,1],
        [FlowPeriodicity.PerSecond,100],
        [FlowPeriodicity.PerMinute,60 * 1000],
        [FlowPeriodicity.PerHour,60 * 60 * 1000],
        [FlowPeriodicity.PerDay,24 * 60 * 60 * 1000],
        [FlowPeriodicity.PerWeek,7 * 24 * 60 * 60 * 1000]
    ]
);

export class ResourceFlow {

    constructor(
        private _resource:Resource, 
        private _amount:number, 
        private _period:FlowPeriodicity,
        private _lastUpdate?:number){
            if(!this._lastUpdate){
                this._lastUpdate = 0;
            }
        }
    get resource():Resource { return this._resource; }
    get amount():number { return this._amount; }
    get period():FlowPeriodicity { return this._period; }

    flow():number{
        const now = Date.now();
        const timeElapsed = now - this._lastUpdate;

        const maxTime = periodDuration.get(this._period);
        
        if( timeElapsed >= maxTime){
            this._lastUpdate = now;
            return this._amount;
        }else{
            return 0;
        }

    }
}