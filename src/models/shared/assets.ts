export interface AssetParams{
    id:string,
    type:string,
    url:string,
    data?:any;
}
export class Asset{
    private _id:string;
    private _type:string;
    private _url:string;
    private _data:string;

    constructor(params:AssetParams){
        this._id = params.id;
        this._type = params.type;
        this._url = params.url;
        this._data = params.data;
    }

    get id():string { return this._id; }
    get type():string { return this._type; }
    get url():string { return this._url; }
    get data():string { return this._data; }
}