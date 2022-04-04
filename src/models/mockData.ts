import { range, randomInt, randomItem } from "../helpers/functions";
import { randomName, randomText } from "../persistence/mockData";
import { FlowPeriodicity, Asset, Media, Player, Resource, Placeable, Cell, InstancePlayer, Stockpile, CellInstance, Vector, Game, GameInstance } from "./monolyth";

const MAP_SIZE = 320;
const NUM_CELLS = 32;
const NUM_PLAYERS = 500;
const NUM_RESOURCES = 32;
const NUM_PLACEABLES = 100;

const periods:FlowPeriodicity[] = [
    FlowPeriodicity.Once,
    FlowPeriodicity.PerSecond,
    FlowPeriodicity.PerMinute
];
function randomAsset():Asset {
    return {
        id:(Math.random() * 65535)+'',
        type:'image',
        url:randomName('url-'),
        data:null
    };
}

function randomMedia(prefix:string='media-'):Media{
    return {
        description:randomText(),
        icon:randomAsset(),
        image:randomAsset(),
        name:randomName(prefix),
        thumbnail:randomAsset()
    }
}

const players:Player[] = range(NUM_PLAYERS).map( i => (
    {
        birthDate:new Date( Date.now() - randomInt(1000 * 60 * 60 * 24 * 365 * 50)), // Algún punto de los últimos 50 años
        email:randomName()+'@here.com',
        id:`player-${i}`,
        name:randomName('player-'),
        password:randomName(),
        surname:randomName()
    }

));

const resources:Resource[] = range(NUM_RESOURCES).map( i => ({id:'res-'+i,media:randomMedia()}));
const placeables:Placeable[] = range(NUM_PLACEABLES).map( i => ( {id:`placeable-${i}`,media:randomMedia(),texture:randomAsset()}) );
const cells:Cell[] = range(NUM_CELLS).map(
    i => ({
        allowedPlaceableIds:range(5).map( i => randomItem(placeables).id),
        id:`cell-${i}`,
        media:randomMedia(),
        texture:randomAsset()
    })
);

const instancePlayers:InstancePlayer[] = players.map( player => ({
    playerId:player.id,
    stockpiles:resources.map( resource => ({
        amount:randomInt(1000),
        resourceId:resource.id
    } as Stockpile) )
}));

const map:CellInstance[] = range(MAP_SIZE * MAP_SIZE).map( i => {
    const cell = randomItem(cells);
    return {
        cellId:cell.id,
        playerId:randomItem(instancePlayers).playerId,
        placeableIds:range(5).map( i => randomItem(cell.allowedPlaceableIds) ),
        position:new Vector(i/MAP_SIZE,i%MAP_SIZE) // cuadradito, perfecto
    }
});
    

const game:Game = {
    id:'theOnlyGame',
    media:randomMedia(),
    cells:cells,
    ownerId:'user-1',
    placeables:placeables,
    resources:resources,
    technologies:[]
};
    

const mockGameInstance:GameInstance = {
    cells:map,
    gameId:game.id,
    players:instancePlayers
};

class LivingGameInstance{
    
}/*
export function evalInstance(data:[Game,GameInstance]){
    const game = data[0];
    const instance = data[1];

    for(const i in instance.cells){
        const cellInstance = instance.cells[i];
        const cell = game.cells[cellInstance.cellId];
        const ownerId = cellInstance.playerId;
        const placeables:Placeable[] = cellInstance.placeableIds.map(game.placeables)

    }
}*/