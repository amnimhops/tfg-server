import { mockGameInstance } from "./persistence/mockData"
import { Connection } from "./persistence/repository";
import { InstanceService } from "./services/instanceService";

const gameInstance = mockGameInstance;

(async()=> {
    try{
        const connection = new Connection();
        const fu = await connection.connect({database:'unnamed_project',host:'localhost'});
        const service = new InstanceService(connection);
        const id = await service.save(gameInstance);
        console.log('Instance saved as',id);
        const newInstance = await service.load(id);
        console.log(newInstance);

    }catch(error:unknown){
        console.log(error);
    }
    
    
})();