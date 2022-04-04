/*import { toMap } from "../helpers/functions";
import { Asset } from "../models/shared/assets";
import { Cell, CellInstance } from "../models/shared/cells";
import { GameInstance, InstancePlayer } from "../models/shared/instances";
import { Obstacle, Placeable, PlaceableType, Structure } from "../models/shared/placeables";
import { Player } from "../models/shared/players";
import { Resource, ResourceFlow, Stockpile } from "../models/shared/resources";
import { Vector } from "../models/shared/shared";
import { WorldDescriptor } from "../models/shared/world";
import { DBGameInstance, DBPlayer, DBResourceFlow, DBWorldDescriptor } from "./schema";

export function buildWorldDescriptor(world:DBWorldDescriptor){
    const cells:Record<string,Cell> = {};
    const placeables:Record<string,Placeable> = {};
    const resources:Record<string,Resource> = {};
    
    world.resources.forEach( r => {
        const resource = new Resource(r.id,r.media);
        resources[resource.id] = resource;
    });

    world.placeables.forEach( p => {
        let placeable:Placeable = null;
        const texture:Asset = p.texture;
        
        switch(p.type){
            case PlaceableType.Obstacle:
                placeable = new Obstacle(p.id,p.media,texture);
                break;
            case PlaceableType.Structure:
                const flows = p.flows?.map( flow => new ResourceFlow(resources[flow.resource],flow.amount,flow.periodicity));
                placeable = new Structure(p.id,p.media,texture,flows);
                break;
        }
        placeables[placeable.id] = placeable;
    });

    world.cells.forEach( c => {
        const allowedPlaceables = c.allowedPlaceables.map( id => placeables[id] )
        const cell = new Cell(c.id,c.media,c.texture,allowedPlaceables);
        cells[cell.id] = cell;
    });

    return new WorldDescriptor(world.id,world.media,resources,placeables,cells);
}
*/
/**
 * Función que construye el modelo de datos de una instancia
 * a partir de la información contenida en la base de datos.
 * @param instance Información de la instancia contenida en la base de datos
 * @param world Información del descriptor del mundo en que se basa esta instancia
 * @param players Información de los jugadores vinculados a esta instancia
 */

/*
export function buildGameInstance(instance:DBGameInstance, world:DBWorldDescriptor, accounts:DBPlayer[]): GameInstance{
    const cellInstances:Record<string,CellInstance> = {};
    const instancePlayers:Record<string,InstancePlayer> = {};
    
    const worldDescriptor:WorldDescriptor = buildWorldDescriptor(world);

    instance.players.forEach( p => {
        const playerAccount = accounts.filter( account => account.id == p.player)[0];
        const player = new Player(playerAccount.id,playerAccount.name,playerAccount.email,playerAccount.password);
        const stockpiles:Record<string,Stockpile> = toMap(
            p.stockpiles.map(sp => new Stockpile(world.resources[sp.resource],sp.amount)),
            record => record.resource.id
        );
        
        // La relación celda-jugador es bidireccional, se establecerá
        // tras construir el mapa de celdas
        const instancePlayer = new InstancePlayer(player,stockpiles); 
        instancePlayers[player.id] = instancePlayer;
    });

    instance.cells.forEach( c => {
        const cell = world.cells[c.cell];
        const owner = instancePlayers[c.owner];
        const cellInstance = new CellInstance(
            c.id,
            cell,
            new Vector(c.position.x,c.position.y),
            c.placeables.map( id => world.placeables[id])
        );
        
        // Se crea el vínculo bidireccional
        owner.addCell(cellInstance);
        cellInstances[c.id] = cellInstance;
    });
    

    const gameInstance = new GameInstance(instance.id,worldDescriptor,cellInstances,instancePlayers);

    return gameInstance;
}
*/
/*

export function buildDBGameInstance(instance:GameInstance):DBGameInstance{
    const dbGameInstance:DBGameInstance = {
        cells:Object.values(instance.map).map( cell => {
            return {
                cell: cell.id,
                owner: cell.owner.player.id,
                id: cell.id,
                placeables : Object.values(cell.placeables).map( p => p.id),
                position: cell.position
            }
        }),
        descriptor: instance.worldDescriptor.id,
        id: instance.id,
        players: Object.values(instance.players).map( ip => {
            return {
                player:ip.player.id,
                stockpiles:Object.values(ip.stockpiles).map( sp => {
                    return {
                        resource:sp.resource.id,
                        amount:sp.amount
                    }
                })
            }
        })
    };

    return dbGameInstance;
}

export function buildDBWorldDescriptor(world:WorldDescriptor):DBWorldDescriptor{
    return {
        id:world.id,
        technologies:null,
        media:world.media,
        cells:Object.values(world.cells).map( cell => {
            return {
                id:cell.id,
                media:cell.media,
                texture:cell.texture,
                allowedPlaceables:Object.values(cell.placeables).map( placeable => placeable.id)
            }
        }),
        placeables: Object.values(world.placeables).map ( placeable => {
            return {
                id:placeable.id,
                media:placeable.media,
                texture:placeable.texture,
                type:placeable.type,
                flows: (placeable instanceof Structure) ? placeable.flows.map( flow => ({
                    resource:flow.resource.id,amount:flow.amount,periodicity:flow.period
                })): []
            }
        }),
        resources: Object.values(world.resources).map( resource => {
            return {
                id:resource.id,
                media: resource.media
            }
        })
    }
}*/