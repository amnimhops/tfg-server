/**
 * Función que convierte un array de elementos en un mapa
 * indexado a partir de una función. En caso de haber elementos
 * que devuelvan la misma clave, solo se devolverá el último.
 * @param array Vector de elementos que será indexado
 * @param fn Función de indexación. Toma como parámetro un elemento del vector y 
 * devuelve la clave de indexación
 * @returns Un mapa con las claves devueltas por la función y los elementos asociados
 * del vector
 */
 export function toMap<T>(array:T[],fn:(record:T)=>string):Record<string,T>{
    const map:Record<string,T> = {};
    array.forEach( record => map[fn(record)] = record );

    return map;
}
/**
 * Crea un vector relleno con números enteros, útil para crear bucles repetitivos
 * mediante Array.prototype.forEach o Array.prototype.map
 * @param amount Si es un número, indica el número de elementos; si es un vector, indica el rango superior e inferior
 * @returns Un vector de números enteros entre 0 y x o entre a y b
 */
 export function range(amount:number|[number,number]):number[]{
    let start = 0, end = 0;

    if(amount instanceof Array){
        start = amount[0];
        end = amount[1];
    }else{
        end = amount;
    }
   
    const elements = [];
    for(let i = start; i<end;i++) elements.push(i);

    return elements;
}

export function randomInt(max:number){
    return Math.floor(Math.random() * max);
}

export function randomProbability(p:number){
    return Math.random() <= (p || 0.5);
}

export function randomItem<T>(list:T[]){
    if(list.length > 0){
        return list[randomInt(list.length)];
    }else{
        throw new Error('The list is empty')
    }
}

export function rgba(r:number,g:number,b:number,a=1):string{
    return `rgb(${r},${g},${b},${a})`
}

export function degrees(rads:number):number{
    return rads * 360 / (Math.PI * 2)
}

export function hsl(hue:number,saturation:number,lightness:number):string{
    return `hsl(${hue},${saturation}%,${lightness}%)`;
}

export function limit(num:number,min?:number,max?:number):number{
    if(!min) min = 0;
    if(!max) max = num;
    return Math.min(Math.max(min,num),max);
}

export function truncate(text:string,maxChars:number):string{
    const words = text.split(" ");
    const selection = [];
    let count = 0, index = 0,stop = false;
    while(!stop){
        if(words[index].length + count >= maxChars){
            // La palabra no se puede añadir sin superar el límite
            // Se añade la elipsis y se termina
            selection.push('...');
            stop = true;
        }else{
            selection.push(words[index]);
            count+=words[index].length;
            index++;
            if(index >= words.length) stop = true;
        }
    }
    return selection.join(' ');
}

export interface CountdownModel{
    weeks:number;
    days:number;
    hours:number;
    minutes:number;
    seconds:number;
}

export function countdown(from:number,to:number):CountdownModel{
    const t = Math.floor(Math.max(from,to)-Math.min(from,to)) / 1000;

    const weeks = Math.floor(t / (60 * 60 * 24 * 7));
    const days = Math.floor((t - weeks * (60 * 60 * 24 * 7)) / (60 * 60 *24));
    const hours = Math.floor((t - weeks * (60 * 60 * 24 * 7) - days * (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((t - weeks * (60 * 60 * 24 * 7) - days * (60 * 60 * 24) - hours * (60 * 60)) / (60));
    const seconds = Math.floor((t - weeks * (60 * 60 * 24 * 7) - days * (60 * 60 * 24) - hours * (60 * 60) - minutes*60));

    return {
        weeks,days,hours,minutes,seconds
    }
}

export function countdownStr(model:CountdownModel,extended:boolean=false):string{
    const times = [];
    if(extended){
        if(model.weeks >0) times.push(model.weeks+" semana"+(model.weeks>1?"s":""));
        if(model.days >0) times.push(model.days+" día"+(model.days>1?"s":""));
        if(model.hours >0) times.push(model.hours+" hora"+(model.hours>1?"s":""));
        if(model.minutes >0) times.push(model.minutes+" minuto"+(model.minutes>1?"s":""));
        times.push(model.seconds+ " segundo"+(model.seconds>1?"s":""));
    }else{
        if(model.weeks >0) times.push(model.weeks+"s");
        if(model.days >0) times.push(model.days+"d");
        if(model.hours >0) times.push(model.hours+"h");
        if(model.minutes >0) times.push(model.minutes+"m");
        times.push(model.seconds+ "sg");
    }
    return times.join(" ");
}

const SI_BASE = 1000;
const SI_UNITS = [
    {unit:'Kilo',symbol:'k'},
    {unit:'Mega',symbol:'M'},
    {unit:'Giga',symbol:'G'},
    {unit:'Tera',symbol:'T'},
    {unit:'Peta',symbol:'P'},
    {unit:'Exa',symbol:'E'}   // Esto equivale a 10^18, el máximo que javascript permite está por debajo (2^53 -1)
];

/**
 * Transforma una cantidad arbitraria de recursos
 * a un número de máximo 4 cifras con la unidad
 * apropiada.
 * @param amount 
 */
export function fmtResourceAmount(amount:number){
    
    let siIndex = -1;

    while(amount > SI_BASE){
        amount /= 1000;
        siIndex = siIndex + 1;
    }

    if(siIndex >= 0){
        return amount.toFixed(2)+SI_UNITS[siIndex].symbol;
    }else{
        return amount.toFixed(0);
    }
    
}