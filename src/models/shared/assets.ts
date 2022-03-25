export class Asset{
    constructor(private id:string,private type:string,private url:string, private data?:any){}
    static createAsset(data:any):Asset{
        return new Asset(data.id,data.type,data.url,data.data);
    }
    public getId():string{
        return this.id
    }

    public getType():string{
        return this.type;
    }
    public getUrl():string{
        return this.url;
    }
    public getData():any{
        return this.data;
    }
}