import { randomItem, range, toMap, randomInt } from "../helpers/functions";
import { Asset } from "../models/shared/assets";
import { Cell, CellInstance } from "../models/shared/cells";
import { GameInstance, InstancePlayer } from "../models/shared/instances";
import { Placeable, Structure } from "../models/shared/placeables";
import { Player } from "../models/shared/players";
import { Resource, Stockpile } from "../models/shared/resources";
import { Vector } from "../models/shared/shared";
import { WorldDescriptor } from "../models/shared/world";

function randomAsset() {
    return new Asset({
        id:(Math.random() * 65535)+'',
        type:'image',
        url:randomName('url-'),
        data:null
    });
}

function randomText(words:number = 10){
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

function randomName(prefix:string = "name-"){
    const dict:string[] = "abcdefghijklmnñopqrstuvwxyz ".split('');
    const rnd = Math.random() * 10;
    const name:string[] = [];
    for(let i = 0;i<3+rnd;i++){
        name.push(randomItem(dict));
    }
    return prefix+name.join('');
}

const players:Player[] = range(50).map( i => new Player(`player-${i}`,randomName('player-'),randomName()+'@here.com',randomName()));

const resources:Resource[] = range(10).map( 
    i => new Resource(`resource-${i}`,randomName('resource'),randomText(),randomAsset(),randomAsset())
);

const placeables:Placeable[] = range(50).map(
    i => new Structure(
        `placeable-${i}`,
        randomName('placeable'),
        randomText(),
        randomAsset(),
        randomAsset(),
        randomAsset()
    )
);
const cells:Cell[] = range(25).map(
    i => new Cell(
        `cell-${i}`,
        randomName('cell'),
        randomText(),
        randomAsset(),
        randomAsset(),
        randomAsset(),
        range(5).map( j=>randomItem(placeables)) // 5 aleatorios
    )
);

const instancePlayers:InstancePlayer[] = players.map( player => new InstancePlayer(
    player,
    toMap(
        resources.map( res => new Stockpile(res,randomInt(100))),
        record => record.resource.id
    )
));

const map:CellInstance[] = range(100).map( i => {
    const cell = randomItem(cells);
    const cellInstance = new CellInstance(
        `cellinstance-${i}`,
        cell,
        new Vector(randomInt(200),randomInt(200)),
        range(2).map( j=>randomItem(cell.placeables)
        )
    )
    // asignar a alguien random
    randomItem(instancePlayers).addCell(cellInstance);
    return cellInstance;
});

const world:WorldDescriptor = new WorldDescriptor(
    randomName('world-'),
    toMap(resources, record => record.id),
    toMap(placeables, record => record.id),
    toMap(cells, record => record.id)
);

export const mockGameInstance:GameInstance = new GameInstance(
    null,
    world,
    toMap(map, record => record.id),
    toMap(instancePlayers, record => record.player.id)
);