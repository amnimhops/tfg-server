import { Unique } from "../../repositories";
import { Asset } from "./assets";
import { Cell } from "./cells";
import { Placeable  } from "./placeables";
import { Resource } from "./resources";
import { Technology } from "./technologies";

interface Persistable{
    toModel():any;
    fromModel(data:any);
}
export class WorldDescriptor{
    cells:Map<string,Cell> = new Map();
    placeables:Map<string,Placeable> = new Map();
    resources:Map<string,Resource> = new Map();
    technologies:Map<string,Technology> = new Map();

    constructor(world:PersistableWorld){
        /**
         * El orden del parseo es importante, ya que las
         * celdas requieren de los emplazables, y estos 
         * puede que de las tecnologías. Así pues hay que
         * cachear en orden inverso de dependencia.
         */
        world.placeables.forEach( placeable => this.addPlaceable(this.readPlaceable(placeable)));
        world.cells.forEach( cell => this.addCell(this.readCell(cell)) );
    }

    addPlaceable(placeable:Placeable){
        this.placeables.set(placeable.getId(),placeable);
    }
    readPlaceable(placeable:PersistablePlaceable){
        return new Placeable(
            placeable.id,
            placeable.name,
            placeable.description,
            this.readAsset(placeable.icon),
            this.readAsset(placeable.image),
            this.readAsset(placeable.texture)
        )
    }
    addCell(cell:Cell){
        this.cells.set(cell.getId(),cell);
    }

    readCell(persistableCell:PersistableCell){
        return new Cell(
            persistableCell.id,
            persistableCell.name,
            persistableCell.description,
            this.readAsset(persistableCell.icon),
            this.readAsset(persistableCell.image),
            this.readAsset(persistableCell.texture),
            persistableCell.allowedPlaceables.map( id => this.placeables.get(id))
        );
    }

    readAsset(persistableAsset: PersistableAsset){
        return new Asset(persistableAsset.id,persistableAsset.type,persistableAsset.url);
    }
}

export interface PersistableAsset{
    id:string,
    url:string,
    type:string
};

export interface PersistablePlaceable{
    id:string;
    name:string;
    type:string;
    description:string;
    icon:PersistableAsset,
    image:PersistableAsset,
    texture:PersistableAsset
}

export interface PersistableCell{
    id:string;
    name:string;
    description:string;
    icon:PersistableAsset;
    image:PersistableAsset;
    texture:PersistableAsset;
    allowedPlaceables:string[];
}

export interface PersistableWorld extends Unique{
    name:string;
    placeables:PersistablePlaceable[];
    cells:PersistableCell[];
}