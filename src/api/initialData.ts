import { mockUniverse } from "../models/mocks";
import { Game, Privileges } from "../models/monolyth";
import { User } from "../models/monolyth";
import { GameInstance } from "../models/monolyth";
import {  } from "../models/assets";
import { Connection,Collections } from "../persistence/repository";
import { randomItem } from "../models/functions";
import * as crypto from 'crypto';
/**
 * Borra todas las instancias, jugadores y juegos. A continuación, reinicia el universo.
 * 
 * @param connection 
 */
export async function bigBounce(connection:Connection):Promise<string>{
    const mocked = mockUniverse();
    const instanceRepo = connection.createRepository<GameInstance>(Collections.GameInstances);
    const gameRepo = connection.createRepository<Game>(Collections.Games);
    const userRepo = connection.createRepository<User>(Collections.Users);

    // Purga total
    await Promise.all([
        instanceRepo.drop(),
        userRepo.drop(),
        gameRepo.drop()
    ]);

    await Promise.all([...mocked.users.map( user => userRepo.save(user))]);
    
    
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

    /**
     * Creamos el usuario administrador
     */
    const admin : User = {
        email:'root@super.user',
        name:'Manuel',
        surname:'Lillo',
        password : crypto.createHash('md5').update('root').digest('hex'),
        privileges:Object.keys(Privileges).map ( key => Privileges[key].id ) // Todos los privilegios        
    }
    
    await userRepo.save(admin);

    return 'Y la luz, se hizo';
}
