import * as mocked from "./models/mocks";
import { startExpress } from "./express";
import { Game, GameInstance, Player } from "./models/monolyth";
import { Collections, Connection } from "./persistence/repository";
import { createAPI } from "./api/api";

//const gameInstance = randomItem(gameInstances);

/**
 * Borra todas las instancias, jugadores y juegos. A continuación, reinicia el universo.
 * 
 * @param connection 
 */
async function bigBounce(connection:Connection){
    const instanceRepo = connection.createRepository<GameInstance>(Collections.GameInstances);
    const gameRepo = connection.createRepository<Game>(Collections.Games);
    const playerRepo = connection.createRepository<Player>(Collections.Players);

    const instances = await instanceRepo.find({});
    const games = await gameRepo.find({});
    const players = await playerRepo.find({});

    const tasks:Promise<any>[] = [];
    tasks.push(...instances.map( instance => instanceRepo.delete(instance.id)));
    tasks.push(...games.map( world => gameRepo.delete(world.id)));
    tasks.push(...players.map( player => playerRepo.delete(player.id)));

    await Promise.all(tasks);
    
    
    for(const instance of mocked.gameInstances){
        const i = await instanceRepo.save(instance);        
        console.log('Instancia guardada',i)
    }
    
    for(const game of mocked.games){
        const i = await gameRepo.save(game);
        console.log('Saved game',i);
    }
    
}

const connection = new Connection();

(async()=> {
    const fu = await connection.connect({database:'unnamed_project',host:'localhost'});
    await bigBounce(connection); //  Resetea el universo
    
    const gameAPI = createAPI(connection);
    const server = startExpress(gameAPI.router);

    await gameAPI.instanceService.startInstances();

    
})().then( () => {
    console.info('Servidor listo');
}).catch( (error) => {
    console.error('Ha habido un error durante la inicialización del servicio:',error)
});

