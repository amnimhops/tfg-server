import { Resource, ResourceAmount } from "./monolyth";

/**
 * Combina cualquier número de cantidades de recursos 
 * sumando y restando las cantidades para devolver una
 * colección de recursos sin identificadores repetidos.
 * @param resourceAmount Recursos a combinar
 * @returns Una nueva lista con la combinación de los recursos 
 * originales. Los recursos originales no se verán alterados
 */
export function combineAmounts(resourceAmount:ResourceAmount[]):ResourceAmount[]{
    const resourceList : Record<string,ResourceAmount> = {};
    resourceAmount.forEach( item => {
        const id = item.resourceId;
        if(resourceList[id]){
            resourceList[id].amount+=item.amount;
        }else{
            resourceList[id] = {...item}; // Es importante no asignar la lista directamente, se puede liar pardísima.
        }
    } );

    return Object.entries(resourceList).map( item => item[1]);
}

/**
 * Crea una copia de la lista de cantidades de recursos pasada
 * como parámetro. Esta función es necesaria para evitar manipular
 * valores que se puedan encontrar cacheados y compartidos
 * en el servidor.
 * @param list Lista de cantidades de recursos
 * @returns Una nueva lista copia de la anterior.
 */
export function cloneAmounts(list:ResourceAmount[]):ResourceAmount[]{
    return list.map( item => ({...item}));
}

export function scaleAmounts(factor:number,list:ResourceAmount[]):ResourceAmount[]{
    return list.map( item => {
        return {
            resourceId:item.resourceId,
            amount:item.amount * factor
        }
    });
}