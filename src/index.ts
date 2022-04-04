import { create } from "domain";
import { Collection } from "mongodb";
import { startExpress } from "./express";
import { mockGameInstance } from "./persistence/mockData"
import { Connection } from "./persistence/repository";
import { Collections, DBGameInstance, DBPlayer, DBWorldDescriptor } from "./models/shared/_old/schema";
import { createAPI } from "./services/api";
import { GameService } from "./services/gameService";
import { InstanceService } from "./services/instanceService";

const gameInstance = mockGameInstance;

/**
 * Borra todas las instancias, jugadores y juegos. A continuación, reinicia el universo.
 * 
 * @param connection 
 */
async function bigBounce(connection:Connection){
    const instanceRepo = connection.createRepository<DBGameInstance>(Collections.GameInstances);
    const worldRepo = connection.createRepository<DBWorldDescriptor>(Collections.Worlds);
    const playerRepo = connection.createRepository<DBPlayer>(Collections.Players);

    const instances = await instanceRepo.find({});
    const worlds = await worldRepo.find({});
    const players = await playerRepo.find({});

    const tasks:Promise<any>[] = [];
    tasks.push(...instances.map( instance => instanceRepo.delete(instance.id)));
    tasks.push(...worlds.map( world => worldRepo.delete(world.id)));
    tasks.push(...players.map( player => playerRepo.delete(player.id)));

    await Promise.all(tasks);
}

const connection = new Connection();

(async()=> {
    const fu = await connection.connect({database:'unnamed_project',host:'localhost'});
    bigBounce(connection); //  Resetea el universo
    
    const gameAPI = createAPI(connection);
    
    const server = startExpress(gameAPI.router);

    
})().then( () => {
    console.info('Servidor listo');
}).catch( (error) => {
    console.error('Ha habido un error durante la inicialización del servicio:',error)
});

