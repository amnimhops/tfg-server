import { randomUUID } from 'crypto';
import { createAsset, getFakeAssets } from './assets';
import { randomInt, randomItem, range } from './functions';
import { emptyUserInterface } from './interface';
import { User,Activity, ActivityType, Asset, Cell, CellInstance, ConstantProperties, FlowPeriodicity, Game, GameInstance, InstancePlayer, Media, Placeable, Player, Properties, Resource, ResourceFlow, Technology, Vector } from './monolyth';

export function mockUniverse(){
    const assets = getFakeAssets();
    function randomMedia(prefix:string=''): Media {
        return {
            description: randomText(),
            icon: randomAsset(prefix),
            image: randomAsset(prefix),
            name: randomName(prefix),
            thumbnail: randomAsset(prefix)
        }
    }
    let rescount = 0;
    function randomAsset(prefix:string): Asset {
        return randomItem(assets.filter( asset => asset.id.startsWith(prefix)));
    
    }
    
    function randomText(words: number = 10) {
        const lipsum = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin congue, nibh vitae lobortis cursus, sapien risus sollicitudin justo, et venenatis diam odio eu turpis. Proin convallis leo ante, a ultrices tortor interdum at. Donec purus lorem, lobortis vel pellentesque id, eleifend id purus. Cras tristique erat sit amet nisl cursus, a pulvinar dui fringilla. Nunc ultricies, leo quis feugiat accumsan, arcu dolor commodo velit, non finibus dolor sapien et lacus. Cras sed erat magna. Proin tellus sapien, eleifend quis euismod eu, vulputate in nunc. Praesent ut lacus ut augue maximus ornare.",
            "Duis nisi felis, fringilla a iaculis a, suscipit quis nulla. Mauris ac diam velit. Suspendisse finibus justo ut sagittis maximus. Nunc luctus placerat nisl maximus placerat. Sed non mi sed lectus faucibus efficitur. Duis vitae lorem pellentesque, lobortis lorem id, imperdiet nulla. Duis id ullamcorper turpis. Donec vel quam nisi. Aliquam erat volutpat. Aliquam sed pellentesque mauris. Donec eros diam, commodo ac enim ut, dictum auctor lectus.",
            "Morbi sit amet ante sed libero mollis euismod pulvinar et elit. Sed accumsan nulla a turpis gravida, non porttitor dolor finibus. Aenean hendrerit, eros in blandit consequat, dolor turpis laoreet massa, in iaculis ipsum libero id orci. Nunc non lorem ligula. Nullam ipsum nunc, egestas id dictum eu, fermentum viverra massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum eget justo convallis, euismod lorem sed, euismod tellus. Vestibulum vel lectus nec augue blandit congue vitae id justo. Aenean fermentum placerat erat a ullamcorper. Vestibulum tellus mauris, convallis eget tempus eu, euismod ac odio. In quis lectus et nisi tincidunt dapibus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam blandit pretium diam, non rhoncus velit auctor at.",
            "Proin ac orci in massa ornare venenatis. Cras at blandit neque. Fusce vel fringilla mauris. Praesent eget risus eget erat rutrum egestas. Aliquam tincidunt velit hendrerit lacus pretium aliquam. Etiam et auctor ligula. Donec eget mi ipsum.",
            "Integer facilisis sollicitudin efficitur. Maecenas quis neque vitae arcu interdum viverra. Aenean dignissim molestie ipsum non varius. Integer sit amet lectus imperdiet, auctor tortor a, placerat massa. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed eu ante enim. Donec vitae pulvinar nibh, non dictum eros. Nulla facilisi. Phasellus non ex ullamcorper, maximus massa et, hendrerit odio. Proin in nisi quis tellus scelerisque commodo et vitae est. Phasellus iaculis tellus ut iaculis laoreet."
        ];
    
        return range(words).map(i => randomItem(randomItem(lipsum).split(' '))).join(' ');
    }
    
    function randomName(prefix: string = "name-") {
        const dict: string[] = "abcdefghijklmnñopqrstuvwxyz ".split('');
        const rnd = Math.random() * 10;
        const name: string[] = [];
        for (let i = 0; i < 3 + rnd; i++) {
            name.push(randomItem(dict));
        }
        return prefix + name.join('');
    }
    
    function randomFlow(): ResourceFlow {
        return {
            resourceId: randomItem(resources).id,
            amount: -5 + randomInt(1000),
            periodicity: FlowPeriodicity.PerSecond
        };
    }
    
    function randomProperties(qCapacity=0,qProcess=0,factor: number = 100): Properties {
        const p: Properties = {};
        return {
            attack: 10 + randomInt(factor),
            defence: 10 + randomInt(factor),
            health: 10 + randomInt(factor),
            spyAvoid: 0,
            queueCapacity: qCapacity,
            queueNumProcesses: qProcess,
            spySucceed: 0
        }
    }
    const NUM_RESOURCES = 20;
    const NUM_PLACEABLES = 50;
    const NUM_CELLS = 30;
    const TECH_LEVEL_DEPTH = 3;
    const MAP_SIZE = 50; // 100 x 100
    const NUM_PLAYERS = MAP_SIZE / 2;
    
    const allPeriods: FlowPeriodicity[] = [
        FlowPeriodicity.PerSecond,
        FlowPeriodicity.PerMinute,
        FlowPeriodicity.PerHour,
        FlowPeriodicity.PerDay,
        FlowPeriodicity.PerWeek
    ];
    const allActivies: ActivityType[] = [
        ActivityType.Attack,
        ActivityType.Build,
        ActivityType.Claim,
        ActivityType.Explore,
        ActivityType.Research,
        ActivityType.Spy,
        ActivityType.Trade
    ]
    
    function generateTechnologies() {
        const techs: Technology[] = [];
        let techid = 0;
        function nextLevel(parent?: string, level = 1): Technology[] {
            const newtechs = range(2).map(i => ({
                id: 'tech' + (techid++),
                media: randomMedia('tech'),
                texture: randomAsset('tech'),
                unlocks: [],
                parent,
                properties: randomProperties()
            } as Technology))
            techs.push(...newtechs);
            console.log(level)
            if (level < TECH_LEVEL_DEPTH) {
                level++;
                newtechs.forEach(newtech => {
                    newtech.unlocks = nextLevel(newtech.id, level).map(t => t.id);
                })
            }
    
            return newtechs;
        }
        
        nextLevel();
    
        // TODO Poner a mano algunas tecnologías que suban los stats del jugador (influence, etc.)
        return techs;
    }
    
    const technologies: Technology[] = generateTechnologies();
    
    const players: Player[] = range(NUM_PLAYERS).map(i => ({
        id: `player-${i}`,
        name: randomName('player Name-'),
        surname: randomName('Surname-'),
        email: randomName() + '@here.com',
        birthDate: new Date(),
        password: 'fus'
    }));
    
    const resources: Resource[] = range(NUM_RESOURCES).map(
        i => ({ id: `resource-${i}`, media: randomMedia('resource-'), properties: randomProperties() })
    );
    
    function createActivity(type: ActivityType, name: string): Activity {
        const activity = {
            media: randomMedia(),
            type,
            /*requiredTech:randomItem(technologies).id,*/
            duration: 10000+randomInt(+10000), // milisegundos
            expenses: range(randomInt(5)).map(i => {
                const res = randomItem(resources);
                return { amount: randomInt(100), resourceId: res.id }
            }),
            properties: {}
        } as Activity
        activity.media.name = name;
        return activity;
    }
    const activities: Activity[] = [
        createActivity(ActivityType.Attack, "Atacar"),
        createActivity(ActivityType.Build, "Construir"),
        createActivity(ActivityType.Claim, "Reclamar"),
        createActivity(ActivityType.Dismantle, "Desmantelar"),
        createActivity(ActivityType.Explore, "Explorar"),
        createActivity(ActivityType.Research, "Investigar"),
        createActivity(ActivityType.Spy, "Espiar"),
        createActivity(ActivityType.Trade, "Comerciar"),
        createActivity(ActivityType.Message, "Hablar")
    ]
    
    const placeables: Placeable[] = range(NUM_PLACEABLES).map(
        i => ({
            id: `placeable-${i}`,
            media: randomMedia('placeable-'),
            texture: randomAsset('placeable-texture'),
            type: randomItem(['obstacle', 'structure']),
            properties: randomProperties(),
            flows: range(randomInt(5)).map(i => randomFlow())
        })
    );
    const cells: Cell[] = range(NUM_CELLS).map(
        i => ({
            id: `c-${i} `,
            media: randomMedia(),
            texture: randomAsset('cell-texture'),
            allowedPlaceableIds: range(5).map(j => randomItem(placeables).id), // 5 aleatorios
            color:'#f0f0f0',
            properties: randomProperties()
        })
    );
    
    const instancePlayers: InstancePlayer[] = players.map(player => ({
        playerId: player.id!,
        media: randomMedia('user-profile'),
        stockpiles: resources.map(res => ({ resourceId: res.id, amount: 100 })),
        queue: [],
        technologies: range(3).map(i => randomItem(technologies).id),
        cells: range(randomInt(100)).map(i => randomInt(MAP_SIZE * MAP_SIZE)),
        properties: randomProperties(10,1),
        instanceId: '',
        exploredCells: []
    }));
    
    /*
    const map:CellInstance[] = range(MAP_SIZE * MAP_SIZE).map( i => {
        const cell = randomItem(cells);
        const cellInstance:CellInstance = {
            cellId:cell.id,
            playerId:randomItem(instancePlayers).playerId,
            position:new Vector(randomInt(200),randomInt(200)),
            placeableIds:[]//range(randomInt(2)).map( j=>randomItem(cell.allowedPlaceableIds))
        }
        return cellInstance;
    });
    */
    const games: Game[] = range(10).map(i => ({
        cells: cells,
        media: {
            description: randomText(100),
            icon: randomAsset(''),
            image: randomAsset('gameportrait'),
            name: randomName(),
            thumbnail: randomAsset('')
        },
        ownerId: 'nobody', // El bang es para que webpack deje de tocar las narices al compilar
        placeables: placeables,
        resources: resources,
        technologies: technologies,
        activities: activities,
        config: {
            unknownCellId: cells[0].id,
            defaultPlayerProperties:{
                queueCapacity: 10,
                queueNumProcesses: 1,
                spySucceed: 25
            }
        },
        userInterface:emptyUserInterface(),
        id: `gid-${i}`
    }));
    
    const gameInstances: GameInstance[] = games.map(game => ({
        cells: range(MAP_SIZE * MAP_SIZE).map(j => {
            const cell = randomItem(cells);
            //const cell = cells[(Math.ceil(j&%cells.length];
            const placeableIds = range(randomInt(cell.allowedPlaceableIds.length)).map(k => cell.allowedPlaceableIds[k]);
            return {
                id: j,
                cellId: cell.id,
                playerId: randomInt(10) > 8 ? randomItem(instancePlayers).playerId : null,
                placeables: [],
                position: new Vector(j % MAP_SIZE, Math.floor(j / MAP_SIZE))
            }
        }),
        gameId: game.id,
        players: instancePlayers,
        nextUUID: 0,
        pendingTradingAgreements: [],
        playerMessages: [],
        maxPlayers:1000,
        size: MAP_SIZE
    }));
    
    const users = range(500).map( i => ({
        email:randomName()+'@'+randomName(),
        password:randomName(),
        name:randomName(),
        privileges:[],
        surname:randomName()
    }as User));    

    return {users,gameInstances,games}
}
