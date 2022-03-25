
import { PersistableWorld, WorldDescriptor } from './models/shared/world';
import {DatabaseConnection} from './repositories';
const connection = new DatabaseConnection();

(async()=>{
    try{
        await connection.connect({
            host:'localhost',
            database:'unnamed_project'
        });

        const repo = connection.createRepository<PersistableWorld>("configurations",);
        const world1:PersistableWorld = {
            name:'Persistent world #1',
            cells:[
                {
                    id:'cell1',
                    description:'cell 1',
                    name:'Pantano',
                    texture:{id:'asset0',type:'image',url:'fu/bar/iconefd'},
                    icon:{id:'asset1',type:'image',url:'fu/bar/icon'},
                    image:{id:'asset2',type:'image',url:'fu/bar/image'},
                    allowedPlaceables:['plac1']
                }
            ],
            placeables:[
                {
                    id:'plac1',
                    description:'first placeable',
                    name:'Energyplant',
                    type:'structure',
                    texture:{id:'asset0',type:'image',url:'fu/bar/iconefd'},
                    icon:{id:'asset3',type:'image',url:'fu/bar/icon2'},
                    image:{id:'asset4',type:'image',url:'fu/bar/image2'},

                }
            ]
        }

        const result = await repo.save(world1);
        const loaded = await repo.load(result.id);
        
        console.log(new WorldDescriptor(loaded));
    }catch(error:any){
        console.error(error);
    }
})();
