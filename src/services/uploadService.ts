import * as path from 'path';
import {writeFile} from 'fs';
import * as imageDataURI from 'image-data-uri';
import * as uuid from 'uuid';
import { FileUpload } from '../models/monolyth';

const UPLOAD_FOLDER = 'assets';
export class UploadService{
    constructor(private resourceBaseUrl:string,private uploadFolder:string){

    }
    save(upload:FileUpload):Promise<string>{
        const newName = uuid.v4()+"."+upload.type; // Type es una extension, esperemos que válida
        const filename = path.join(this.uploadFolder,UPLOAD_FOLDER,newName);
        // https://www.npmjs.com/package/image-data-uri
        const data = imageDataURI.decode(upload.data);
        
        return new Promise( (resolve,reject) => {
            writeFile(filename,data.dataBuffer,(err) => {
                if(err) reject(err);
                else resolve(this.resourceBaseUrl+UPLOAD_FOLDER+"/"+newName);
            })
        });
    }
    
}