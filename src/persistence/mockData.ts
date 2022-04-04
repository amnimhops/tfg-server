import { randomInt, randomItem, range, toMap } from "../helpers/functions";
import { Asset, Cell, CellInstance, FlowPeriodicity, Game, GameInstance, InstancePlayer, Media, Placeable, Player, Resource, ResourceFlow, Vector } from "../models/monolyth";
import { WorldDescriptor } from "../models/shared/_old/world";

const NUM_PLAYERS = 50;
const NUM_RESOURCES = 20;
const NUM_PLACEABLES = 50;
const NUM_CELLS = 30;
const MAP_SIZE = 500; // 100 x 100

function randomMedia(prefix:string='media-'):Media{
    return {
        description:randomText(),
        icon:randomAsset(),
        image:randomAsset(),
        name:randomName(prefix),
        thumbnail:randomAsset()
    }
}
function randomAsset():Asset {
    return {
        id:(Math.random() * 65535)+'',
        type:'image',
        url:randomName('url-'),
        data:null
    };
}

export function randomText(words:number = 10){
    const lipsum = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin congue, nibh vitae lobortis cursus, sapien risus sollicitudin justo, et venenatis diam odio eu turpis. Proin convallis leo ante, a ultrices tortor interdum at. Donec purus lorem, lobortis vel pellentesque id, eleifend id purus. Cras tristique erat sit amet nisl cursus, a pulvinar dui fringilla. Nunc ultricies, leo quis feugiat accumsan, arcu dolor commodo velit, non finibus dolor sapien et lacus. Cras sed erat magna. Proin tellus sapien, eleifend quis euismod eu, vulputate in nunc. Praesent ut lacus ut augue maximus ornare.",
        "Duis nisi felis, fringilla a iaculis a, suscipit quis nulla. Mauris ac diam velit. Suspendisse finibus justo ut sagittis maximus. Nunc luctus placerat nisl maximus placerat. Sed non mi sed lectus faucibus efficitur. Duis vitae lorem pellentesque, lobortis lorem id, imperdiet nulla. Duis id ullamcorper turpis. Donec vel quam nisi. Aliquam erat volutpat. Aliquam sed pellentesque mauris. Donec eros diam, commodo ac enim ut, dictum auctor lectus.",
        "Morbi sit amet ante sed libero mollis euismod pulvinar et elit. Sed accumsan nulla a turpis gravida, non porttitor dolor finibus. Aenean hendrerit, eros in blandit consequat, dolor turpis laoreet massa, in iaculis ipsum libero id orci. Nunc non lorem ligula. Nullam ipsum nunc, egestas id dictum eu, fermentum viverra massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum eget justo convallis, euismod lorem sed, euismod tellus. Vestibulum vel lectus nec augue blandit congue vitae id justo. Aenean fermentum placerat erat a ullamcorper. Vestibulum tellus mauris, convallis eget tempus eu, euismod ac odio. In quis lectus et nisi tincidunt dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam blandit pretium diam, non rhoncus velit auctor at.",
        "Proin ac orci in massa ornare venenatis. Cras at blandit neque. Fusce vel fringilla mauris. Praesent eget risus eget erat rutrum egestas. Aliquam tincidunt velit hendrerit lacus pretium aliquam. Etiam et auctor ligula. Donec eget mi ipsum.",
        "Integer facilisis sollicitudin efficitur. Maecenas quis neque vitae arcu interdum viverra. Aenean dignissim molestie ipsum non varius. Integer sit amet lectus imperdiet, auctor tortor a, placerat massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed eu ante enim. Donec vitae pulvinar nibh, non dictum eros. Nulla facilisi. Phasellus non ex ullamcorper, maximus massa et, hendrerit odio. Proin in nisi quis tellus scelerisque commodo et vitae est. Phasellus iaculis tellus ut iaculis laoreet."
    ];
    const text = [];let i = 0; let j = 0;
    while(words-- > 0){
        const sentenceWords = lipsum[i++ % lipsum.length].split(' ');
        const word = sentenceWords[j++ % sentenceWords.length];
        text.push(word);
    }
    return text.join(' ');
}

export function randomName(prefix:string = "name-"){
    const dict:string[] = "abcdefghijklmnñopqrstuvwxyz ".split('');
    const rnd = Math.random() * 10;
    const name:string[] = [];
    for(let i = 0;i<3+rnd;i++){
        name.push(randomItem(dict));
    }
    return prefix+name.join('');
}

function randomFlow():ResourceFlow{
    return {
        resourceId:randomItem(resources).id,
        amount:randomInt(1000),
        periodicity:randomItem(periods)
    };
}

const periods:FlowPeriodicity[] = [
    FlowPeriodicity.Once,
    FlowPeriodicity.PerSecond,
    FlowPeriodicity.PerMinute,
    FlowPeriodicity.PerHour,
    FlowPeriodicity.PerDay,
    FlowPeriodicity.PerWeek
];
const players:Player[] = range(NUM_PLAYERS).map( i => ({
    id:`player-${i}`,
    name:randomName('player Name-'),
    surname:randomName('Surname-'),
    email:randomName()+'@here.com',
    birthDate:new Date(),
    password:'fus'
}));

const resources:Resource[] = range(NUM_RESOURCES).map( 
    i => ({id:`resource-${i}`,media:randomMedia('resource-')})
);

const placeables:Placeable[] = range(NUM_PLACEABLES).map(
    i => ({
        id:`placeable-${i}`,
        media:randomMedia('placeable-'),
        texture:randomAsset(),
        flows:range(randomInt(5)).map( i => randomFlow())
    })
);
const cells:Cell[] = range(NUM_CELLS).map(
    i => ({
        id:`cell-${i}`,
        media:randomMedia('cell-'),
        texture:randomAsset(),
        allowedPlaceableIds:range(5).map( j=>randomItem(placeables).id) // 5 aleatorios
    })
);

const instancePlayers:InstancePlayer[] = players.map( player => ({
    playerId:player.id,
    stockpiles:resources.map( res => ({resourceId:res.id,amount:randomInt(100)}))
}));

const map:CellInstance[] = range(MAP_SIZE * MAP_SIZE).map( i => {
    const cell = randomItem(cells);
    const cellInstance:CellInstance = {
        cellId:cell.id,
        playerId:randomItem(instancePlayers).playerId,
        position:new Vector(randomInt(200),randomInt(200)),
        placeableIds:range(2).map( j=>randomItem(cell.allowedPlaceableIds))
    }
    return cellInstance;
});

const world:Game= {
    cells:cells,
    media:{
        description:randomName(),
        icon:randomAsset(),
        image:randomAsset(),
        name:randomName(),
        thumbnail:randomAsset()
    },
    ownerId:null,
    placeables:placeables,
    resources:resources,
    technologies:[],
    id:'gid-1'
}

export const mockGameInstance:GameInstance = {
    cells:range(MAP_SIZE * MAP_SIZE).map( i => {
        const cell = randomItem(cells);
        const placeableIds = range([0,cell.allowedPlaceableIds.length]).map( i => cell.allowedPlaceableIds[i]);
        return {
            cellId:cell.id,
            playerId:randomItem(players).id,
            placeableIds,
            position:new Vector(i/10,i%10)
        }
    }),
    gameId:world.id,
    players:instancePlayers
}