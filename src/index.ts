import {mockUniverse} from "./models/mocks";
import {config} from 'dotenv';
import { startExpress } from "./express";
import { Game, GameInstance, Player, User } from "./models/monolyth";
import { Collections, Connection } from "./persistence/repository";
import { createAPI } from "./api/api";
import { randomItem } from "./models/functions";
import { setupFakeAssets } from "./models/assets";

/*
 * Antes de nada, ejecutar config() del módulo dotenv
 * para tener acceso a las variables de entorno
 */
config();
console.log(process.env);

setupFakeAssets(process.env.CDN_URL);
const mocked = mockUniverse();
/**
 * Borra todas las instancias, jugadores y juegos. A continuación, reinicia el universo.
 * 
 * @param connection 
 */
async function bigBounce(connection:Connection){
    
    const instanceRepo = connection.createRepository<GameInstance>(Collections.GameInstances);
    const gameRepo = connection.createRepository<Game>(Collections.Games);
    const playerRepo = connection.createRepository<Player>(Collections.Players);
    const userRepo = connection.createRepository<User>(Collections.Users);

    const instances = await instanceRepo.find({});
    const games = await gameRepo.find({});
    const players = await playerRepo.find({});

    const tasks:Promise<any>[] = [];
    tasks.push(...instances.map( instance => instanceRepo.delete(instance.id)));
    tasks.push(...games.map( world => gameRepo.delete(world.id)));
    tasks.push(...players.map( player => playerRepo.delete(player.id)));
    tasks.push(...mocked.users.map( user => userRepo.save(user)));
    await Promise.all(tasks);
    
    
    for(const instance of mocked.gameInstances){
        const i = await instanceRepo.save(instance);        
        console.log('Instancia guardada',i)
    }
    
    for(const game of mocked.games){
        // Asignamos un propietario random
        game.ownerId = randomItem(mocked.users).id;
        const i = await gameRepo.save(game);
        console.log('Saved game',i);
    }
    
}

const connection = new Connection();

(async()=> {
    const fu = await connection.connect();
    await bigBounce(connection); //  Resetea el universo
    
    const gameAPI = createAPI(connection);
    const server = startExpress(gameAPI.router);

    await gameAPI.instanceService.startInstances();

    
})().then( () => {
    console.info('Servidor listo');
}).catch( (error) => {
    console.error('Ha habido un error durante la inicialización del servicio:',error)
});

