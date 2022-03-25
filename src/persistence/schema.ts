import { PlaceableType } from "../models/shared/placeables";

type DBInfo = {
    id:string;
    name:string;
    description:string;
    icon:DBAsset;
    image:DBAsset;
}
type DBAsset = {
    id:string,
    url:string,
    type:string,
    data:any
}

type DBVector = {
    x:number;
    y:number;
}
export type DBCell = DBInfo & {
    texture:DBAsset;
    allowedPlaceables:string[];
}
export type DBResource = DBInfo & {
   
}

export type DBPlaceable = DBInfo & {
    type: PlaceableType;
    texture:DBAsset;
}
export type DBTechnology = DBInfo & {

}
export type DBWorldDescriptor = {
    id:string;
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