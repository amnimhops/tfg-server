import { Asset } from "./assets";
import { ResourceFlow } from "./resources";
import { Media } from "./shared";

export enum PlaceableType {
    Obstacle,
    Structure
};

export class Placeable{
    constructor(
        private _id: string,
        private _media: Media,
        private _texture: Asset,
        private _type:PlaceableType
    ) {}
    get id():string { return this._id; }
    get media():Media { return this._media};
    get texture():Asset { return this._texture; }
    get type():PlaceableType { return this._type; }
}

export class Obstacle extends Placeable {
    static readonly OBSTACLE:string = 'Obstacle';
    constructor(
        id: string,
        media:Media,
        texture: Asset
    ) {
        super(id,media,texture,PlaceableType.Obstacle);
    }

    

}

export class Structure extends Placeable {
    constructor(
        id: string,
        media:Media,
        texture: Asset,
        private _flows:ResourceFlow[]
    ) {
        super(id,media,texture,PlaceableType.Structure);
    }
    get flows():ResourceFlow[] { return this._flows; }
}
