import { toMap } from "./functions";
import { Activity, ActivityType, Cell, Game, Placeable, Resource, Technology } from "./monolyth";

/**
 * Construye un índice consultable a partir de un descriptor de juego
 */
export class GameData{
    cells:Record<string,Cell>
    placeables:Record<string,Placeable>;
    resources:Record<string,Resource>;   
    technologies:Record<string,Technology>;
    activities:Map<ActivityType,Activity>;
    
    constructor(game:Game){
        this.cells = toMap(game.cells, (cell) => cell.id);
        this.placeables = toMap(game.placeables, (placeable) => placeable.id);
        this.resources = toMap(game.resources, (resource) => resource.id);
        this.activities = new Map( game.activities.map( activity => [activity.type,activity]) );
        this.technologies = toMap(game.technologies, (tech) => tech.id);
    }
}