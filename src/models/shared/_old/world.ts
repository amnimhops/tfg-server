import { Cell } from "./cells";
import { Placeable  } from "./placeables";
import { Resource } from "./resources";
import { Media } from "./shared";

export class WorldDescriptor{
    constructor(
        private _id:string,
        private _media:Media,
        private _resources:Record<string,Resource>,
        private _placeables:Record<string,Placeable>,
        private _cells:Record<string,Cell>
    ){}
    get id():string { return this._id; }
    set id(id:string) {this._id = id; }
    get media():Media { return this._media};
    get resources():Record<string,Resource> { return this._resources; }
    get placeables():Record<string,Placeable> { return this._placeables; }
    get cells():Record<string,Cell> { return this._cells; }

    findMedia():Media[]{
        const media:Media[] = [];

        for(let key in this._resources){ media.push(this._resources[key].media); }
        for(let key in this._placeables){ media.push(this._placeables[key].media); }
        media.push(this._media);

        return media;
    }
}