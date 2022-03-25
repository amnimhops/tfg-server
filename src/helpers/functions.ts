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
 export  function toMap<T>(array:T[],fn:(record:T)=>string):Record<string,T>{
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
    return Math.random() >= (p || 0.5);
}

export function randomItem<T>(list:T[]){
    if(list.length > 0){
        return list[randomInt(list.length)];
    }else{
        throw new Error('The list is empty')
    }
}
