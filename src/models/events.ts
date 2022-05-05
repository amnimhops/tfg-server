export interface IEventEmitter{
    on<T>(event:string,callback:(data:T)=>void):void;
    off<T>(event:string,callback:(data:T)=>void):void;
}

export class EventEmitter implements IEventEmitter{
    private listeners:Record<string,((data:any)=>void)[]> = {};

    constructor(){
        this.listeners = {};
    }
    protected hasListener(event:string):boolean{
        return this.listeners[event] !== undefined && this.listeners[event].length > 0;
    }

    destroy(){
        for(const key in this.listeners){
            delete this.listeners[key];
        }
    }

    on<T>(event:string,callback:(data:T)=>void):void{
        if(this.listeners[event] === undefined){
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    off<T>(event:string,callback:(data:T)=>void):void{
        if(this.listeners[event]){
            for(let i = 0; i<this.listeners[event].length; i++){
                if(this.listeners[event][i] === callback){
                    console.log('Removed callback for event',event);
                    this.listeners[event].splice(i,1);
                }
            }
        }
    }
    raise<T>(event:string,data?:T){
        if(this.listeners[event] !== undefined){
            this.listeners[event].forEach( callback => callback(data));
        }else{
            console.warn(`${event} is not listened`);
        }
    }
}