import { config } from 'dotenv';
import { startExpress } from "./express";
import { Connection } from "./persistence/repository";
import { createAPI } from "./api/api";
import { getInstance, getInstances } from './live/instances';

/*
 * Antes de nada, ejecutar config() del módulo dotenv
 * para tener acceso a las variables de entorno
 */

config();
console.log(process.env);


(async () => {
    const connection = new Connection();

    await connection.connect();
    const gameAPI = createAPI(connection);
    const server = startExpress(gameAPI.router);
    // Durante el desarrollo tener todas las instancias
    // arrancadas es bastante lento, se desactiva
    await gameAPI.instanceService.startInstances();

    /**
     * Registramos el listener de finalización para guardar el
     * estado de toda la aplicación
     */
    process.on('SIGINT',() => {
        console.log('Terminando la aplicación, guardando instancias.');

        Promise
            .all([...getInstances().map( instance => gameAPI.instanceService.update(instance.getGameInstance()) )])
            .then( ()=>{
                console.log('Todas las instancias guardadas');
                process.exit(1);
            });
    })

})().then(() => {
    console.info('Servidor listo');
}).catch((error) => {
    console.error('Ha habido un error durante la inicialización del servicio:', error)
});

