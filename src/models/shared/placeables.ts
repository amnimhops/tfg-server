import { Asset } from "./assets";
import { Info } from "./shared";

export enum PlaceableType {
    Obstacle,
    Structure
};

export class Placeable extends Info {
    constructor(
        id: string,
        name: string,
        description: string,
        icon: Asset,
        image: Asset,
        private _texture: Asset,
        private _type:PlaceableType
    ) {
        super(id, name, description, icon, image);
    }
    get texture():Asset { return this._texture; }
    get type():PlaceableType { return this._type; }
}

export class Obstacle extends Placeable {
    static readonly OBSTACLE:string = 'Obstacle';
    constructor(
        id: string,
        name: string,
        description: string,
        icon: Asset,
        image: Asset,
        texture: Asset
    ) {
        super(id, name, description, icon, image, texture,PlaceableType.Obstacle);
    }
}

export class Structure extends Placeable {
    constructor(
        id: string,
        name: string,
        description: string,
        icon: Asset,
        image: Asset,
        texture: Asset
    ) {
        super(id, name, description, icon, image, texture,PlaceableType.Structure);
    }
}
