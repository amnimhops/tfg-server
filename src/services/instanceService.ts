import { toMap } from "../helpers/functions";
import { Asset } from "../models/shared/assets";
import { Cell, CellInstance } from "../models/shared/cells";
import { GameInstance, InstancePlayer } from "../models/shared/instances";
import { Obstacle, Placeable, PlaceableType, Structure } from "../models/shared/placeables";
import { Player } from "../models/shared/players";
import { Resource, Stockpile } from "../models/shared/resources";
import { Vector } from "../models/shared/shared";
import { Technology } from "../models/shared/technologies";
import { WorldDescriptor } from "../models/shared/world";
import { Connection, Repository, SearchResult } from "../persistence/repository";
import { DBCell, DBGameInstance, DBPlayer, DBStockpile, DBWorldDescriptor } from "../persistence/schema";

/**
 * Función que construye el modelo de datos de una instancia
 * a partir de la información contenida en la base de datos.
 * @param instance Información de la instancia contenida en la base de datos
 * @param world Información del descriptor del mundo en que se basa esta instancia
 * @param players Información de los jugadores vinculados a esta instancia
 */
function buildGameInstance(instance:DBGameInstance, world:DBWorldDescriptor, accounts:DBPlayer[]): GameInstance{
    const cells:Record<string,Cell> = {};
    const placeables:Record<string,Placeable> = {};
    const resources:Record<string,Resource> = {};
    const cellInstances:Record<string,CellInstance> = {};
    const instancePlayers:Record<string,InstancePlayer> = {};
    
    world.placeables.forEach( p => {
        let placeable:Placeable = null;
        const image:Asset = new Asset(p.image);
        const icon:Asset = new Asset(p.icon);
        const texture:Asset = new Asset(p.texture);

        switch(p.type){
            case PlaceableType.Obstacle:
                placeable = new Obstacle(p.id,p.name,p.description,icon,image,texture);
                break;
            case PlaceableType.Structure:
                placeable = new Structure(p.id,p.name,p.description,icon,image,texture);
                break;
        }
        placeables[placeable.id] = placeable;
    });

    world.cells.forEach( c => {
        const image:Asset = new Asset(c.image);
        const icon:Asset = new Asset(c.icon);
        const texture:Asset = new Asset(c.texture);
        const allowedPlaceables = c.allowedPlaceables.map( id => placeables[id] )
        const cell = new Cell(c.id,c.name,c.description,icon,image,texture,allowedPlaceables);
        cells[cell.id] = cell;
    });

    world.resources.forEach( r => {
        const image:Asset = new Asset(r.image);
        const icon:Asset = new Asset(r.icon);
        const resource = new Resource(r.id,r.name,r.description,icon,image);
        resources[resource.id] = resource;
    });

    instance.players.forEach( p => {
        const playerAccount = accounts.filter( account => account.id == p.player)[0];
        const player = new Player(playerAccount.id,playerAccount.name,playerAccount.email,playerAccount.password);
        const stockpiles:Record<string,Stockpile> = toMap(
            p.stockpiles.map(sp => new Stockpile(resources[sp.resource],sp.amount)),
            record => record.resource.id
        );
        
        // La relación celda-jugador es bidireccional, se establecerá
        // tras construir el mapa de celdas
        const instancePlayer = new InstancePlayer(player,stockpiles); 
        instancePlayers[player.id] = instancePlayer;
    });

    instance.cells.forEach( c => {
        const cell = cells[c.cell];
        const owner = instancePlayers[c.owner];
        const cellInstance = new CellInstance(
            c.id,
            cell,
            new Vector(c.position.x,c.position.y),
            c.placeables.map( id => placeables[id])
        );
        
        // Se crea el vínculo bidireccional
        owner.addCell(cellInstance);
        cellInstances[c.id] = cellInstance;
    });
    
    /*world.technologies.forEach( t => {
        const image:Asset = new Asset(t.image);
        const icon:Asset = new Asset(t.icon);
        const technology = new Technology()
        resources.set(resource.getId(),resource);
    })*/

    const worldDescriptor = new WorldDescriptor(world.id,resources,placeables,cells);
    const gameInstance = new GameInstance(instance.id,worldDescriptor,cellInstances,instancePlayers);

    return gameInstance;
}

function buildDBGameInstance(instance:GameInstance):DBGameInstance{
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

export class InstanceService {
    private instanceStore:Repository<DBGameInstance>;
    private descriptorStore:Repository<DBWorldDescriptor>;
    private playerStore:Repository<DBPlayer>;

    constructor(connection:Connection){
        this.descriptorStore = connection.createRepository<DBWorldDescriptor>("worldDescriptors");
        this.instanceStore = connection.createRepository<DBGameInstance>("gameInstances");
        this.playerStore = connection.createRepository<DBPlayer>("players");
    }

    async save(instance: GameInstance): Promise<string> {
        const dbInstance = buildDBGameInstance(instance);
        const id = await this.instanceStore.save(dbInstance);
        if(instance.id == undefined){
            instance.id = id;
        }

        return instance.id;
    }

    async load(id: string): Promise<GameInstance>{
        const instance = await this.instanceStore.load(id);
        const world = await this.descriptorStore.load(instance.descriptor);
        const players = await this.playerStore.find(instance.players);

        return buildGameInstance(instance,world,players);
    }
}