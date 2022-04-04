import { PlaceableType } from "./placeables";
import { FlowPeriodicity } from "./resources";

type DBAsset = {
    id:string,
    url:string,
    type:string,
    data?:any;
}

type DBMedia = {
    name:string;
    description:string;
    icon:DBAsset;
    thumbnail:DBAsset;
    image:DBAsset;
}
type DBVector = {
    x:number;
    y:number;
}
export type DBCell = {
    id:string;
    media:DBMedia;
    texture:DBAsset;
    allowedPlaceables:string[];
}
export type DBResource =  {
   id:string;
   media:DBMedia;
}

export type DBResourceFlow = {
    resource:string; // Apunta a DBWorldDescriptor.resources.id
    amount:number;
    periodicity:FlowPeriodicity;
}
export type DBPlaceable = {
    id:string;
    media:DBMedia;
    type: PlaceableType;
    texture:DBAsset;
    flows?:DBResourceFlow[];
}
export type DBTechnology = {
    id:string;
    media:DBMedia;
    type: PlaceableType;
    flows?:DBResourceFlow[];
}
export type DBWorldDescriptor = {
    id:string;
    media:DBMedia;
    technologies:DBTechnology[];
    placeables:DBPlaceable[];
    resources:DBResource[];
    cells:DBCell[];
}

export type DBPlayer = {
    id:string;
    name:string;
    email:string;
    password:string;
}


/**
 * Tipo correspondiente a la colección db.gameInstances.
 * 
 * Los documentos de mongodb están limitados a 16Mb. Si cells
 * fuera un array de referencias a celdas, podría albergar como
 * máximo un mapa de 1.398.101 celdas, por lo que hablaríamos de 
 * una dimensión máxima por software de 1000 x 1000. En cambio,
 * actualmente está definido como un array de objetos con un tamaño
 * mínimo de ~72 bytes por celda, lo que da un máximo de 222k celdas
 * y un mapa de 471 x 471.
 */
 export type DBGameInstance = {
    id:string;
    descriptor:string; // Apunta a db.descriptors
    players:DBInstancePlayer[]; 
    cells:DBCellInstance[];
}
/**
 * Subtipo correspondiente a la colección db.gameInstances.cells
 */
 export type DBCellInstance = {
    // NO debes quitar el ID. Aunque no sea una referencia en mongo, sí es necesario
    // para referenciar las instancias en el juego(panel, etc)
    id:string; // 4-16 bytes
    position:DBVector; // 8bytes
    cell:string; // Apunta a DBWorldDescriptor.cells.id, 12 bytes
    owner:string; // Apunta a DBPlayer.id, 12 bytes
    placeables:string[]; // Apunta a DBWorldDescriptor.placeables.id
}

/**
 * Subtipo correspondiente a la colección db.gameInstances.players
 */
 export type DBInstancePlayer = {
    player:string; // Apunta a DBPlayer.id
    stockpiles:DBStockpile[];
}

export type DBStockpile = {
    resource:string; // Apunta a DBWorldDescriptor.resources.id
    amount:number;
}


export enum Collections {
    Worlds = "worldDescriptors",
    GameInstances = "gameInstances",
    Players = "players",
    Users = "users"
}