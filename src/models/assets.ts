import { Asset, UIConfig } from "./monolyth";

/**
 * Asset vacío
 */
export const ASSET_EMPTY:Asset = {
    id:'',
    type:'image',
    url:'',
    data:null
}
/**
 * Devuelve un asset con las características indicadas
 * @param id 
 * @param type 
 * @param url 
 * @param data 
 * @returns 
 */
export function createAsset(id:string,type:'image'|'sound'|'text'|'json',url:string,data:any = null):Asset{
    return {id,type,url,data}
}

/**
 * Claves de los assets estáticos, aquellos con nombre constante
 * pero imagen variable
 */
const staticAssetKeys = {
    /* Icons */
    UI_OK:'icon-ok',
    UI_WARNING:'icon-warning',
    UI_CANCEL:'icon-cancel',
    UI_ADD:'icon-add',
    UI_DELETE:'ui-delete',
    /* Activities */
    ICON_BUILD:'icon-build',
    ICON_DISMANTLE:'icon-dismantle',
    ICON_SPY:'icon-spy',
    ICON_TRADE:'icon-trade',
    ICON_ATTACK:'icon-attack',
    ICON_CLAIM:'icon-claim',
    ICON_EXPLORE:'icon-explore',
    ICON_RESEARCH:'icon-research',
    ICON_MESSAGE:'icon-message',
    /* Map / Cells */
    HEX_SELECTED:'hex-selected',
    HEX_UNEXPLORED:'hex-unexplored',
    
    /* Section icons */
    ICON_SECTION_AREA:'icon-section-area',
    ICON_SECTION_RESOURCES:'icon-section-resources',
    ICON_SECTION_TECHNOLOGY:'icon-section-technology',
    ICON_SECTION_WORLD:'icon-section-world',
    ICON_SECTION_ACTIVITIES:'icon-section-activities',
    ICON_SECTION_MESSAGES:'icon-section-messages',
    
    /* More icons */
    ICON_PLAYERS:'icon-players',
    ICON_MSG_MESSAGE:'icon-msg-message',
    ICON_MSG_NOTIFICATION:'icon-msg-notification',
    ICON_MSG_REPORT:'icon-msg-report',
    
    /* Section backgrounds */
    TECH_BACKGROUND: 'tech-background',
    HOME_BACKGROUND: 'home-background',
    RESOURCE_BACKGROUND: 'resource-background',
    MESSAGING_BACKGROUND: 'messaging-background',
    ACTIVITY_BACKGROUND: 'activity-background',

    /* Messaging section assets */
    MESSAGING_MESSAGE : 'messaging-message-image',
    MESSAGING_NOTIFICATION : 'messaging-notification-image',
    MESSAGING_REPORT : 'messaging-report-image',

    /* Elementos desconocidos */
    UNKNOWN_IMAGE:'unknown_image'
}

/**
 * Devuelve los assets estáticos por defecto
 * @param baseUrl URL donde se espera encontrar el recurso
 * @returns 
 */
export function getDefaultStaticAssets(baseUrl:string):Asset[] {
    baseUrl = baseUrl + 'default/';
    console.log(baseUrl);
    return [
        createAsset(staticAssetKeys.HEX_SELECTED,'image', baseUrl + 'hex-selected.png'),
        createAsset(staticAssetKeys.HEX_UNEXPLORED,'image', baseUrl + 'hex-unexplored.png'),
        createAsset(staticAssetKeys.UI_OK,'image', baseUrl + 'icon-accept.svg'),
        createAsset(staticAssetKeys.UI_ADD,'image', baseUrl + 'icon-add.svg'),
        createAsset(staticAssetKeys.UI_DELETE,'image', baseUrl + 'icon-delete.svg'),
        createAsset(staticAssetKeys.UI_CANCEL,'image', baseUrl + 'icon-close.svg'),
        createAsset(staticAssetKeys.UI_WARNING,'image', baseUrl + 'icon-warning.svg'),

        createAsset(staticAssetKeys.ICON_DISMANTLE,'image', baseUrl + 'icon-dismantle.svg'),
        createAsset(staticAssetKeys.ICON_BUILD,'image', baseUrl + 'icon-build.svg'),
        createAsset(staticAssetKeys.ICON_RESEARCH,'image', baseUrl + 'icon-research.svg'),
        createAsset(staticAssetKeys.ICON_SPY,'image', baseUrl + 'icon-spy.svg'),
        createAsset(staticAssetKeys.ICON_TRADE,'image', baseUrl + 'icon-trade.svg'),
        createAsset(staticAssetKeys.ICON_ATTACK,'image', baseUrl + 'icon-attack.svg'),
        createAsset(staticAssetKeys.ICON_CLAIM,'image', baseUrl + 'icon-claim.svg'),
        createAsset(staticAssetKeys.ICON_EXPLORE,'image', baseUrl + 'icon-explore.svg'),
        createAsset(staticAssetKeys.ICON_MESSAGE,'image', baseUrl + 'icon-section-messages.svg'),

        createAsset(staticAssetKeys.ICON_SECTION_AREA,'image', baseUrl + 'icon-section-area.svg'),
        createAsset(staticAssetKeys.ICON_SECTION_RESOURCES,'image', baseUrl + 'icon-section-resources.svg'),
        createAsset(staticAssetKeys.ICON_SECTION_TECHNOLOGY,'image', baseUrl + 'icon-section-technologies.svg'),
        createAsset(staticAssetKeys.ICON_SECTION_WORLD,'image', baseUrl + 'icon-section-world.svg'),
        createAsset(staticAssetKeys.ICON_SECTION_ACTIVITIES,'image', baseUrl + 'icon-section-activities.svg'),
        createAsset(staticAssetKeys.ICON_SECTION_MESSAGES,'image', baseUrl + 'icon-section-messages.svg'),

        createAsset(staticAssetKeys.TECH_BACKGROUND,'image',baseUrl + 'tech-background.webp'),
        createAsset(staticAssetKeys.RESOURCE_BACKGROUND,'image',baseUrl + 'resource-background.png'),
        createAsset(staticAssetKeys.HOME_BACKGROUND,'image',baseUrl + 'home-background.png'),
        createAsset(staticAssetKeys.MESSAGING_BACKGROUND,'image',baseUrl + 'messaging-background.webp'),
        createAsset(staticAssetKeys.ACTIVITY_BACKGROUND,'image',baseUrl + 'activity-background.webp'),

        createAsset(staticAssetKeys.ICON_MSG_MESSAGE,'image',baseUrl + 'icon-msg-message.svg'),
        createAsset(staticAssetKeys.ICON_MSG_NOTIFICATION,'image',baseUrl + 'icon-msg-notification.svg'),
        createAsset(staticAssetKeys.ICON_MSG_REPORT,'image',baseUrl + 'icon-msg-report.svg'),
        
        createAsset(staticAssetKeys.MESSAGING_MESSAGE,'image',baseUrl + 'image-messaging-message.png'),
        createAsset(staticAssetKeys.MESSAGING_NOTIFICATION,'image',baseUrl + 'image-messaging-notification.png'),
        createAsset(staticAssetKeys.MESSAGING_REPORT,'image',baseUrl + 'image-messaging-report.webp'),

        createAsset(staticAssetKeys.ICON_PLAYERS,'image',baseUrl + 'icon-players.svg'),
        createAsset(staticAssetKeys.UNKNOWN_IMAGE,'image',baseUrl + 'unknown-image.png')
        
    ]
}

/**
 * Lista de assets arbitrarios, empleados durante
 * la generación de mundos aleatorios.
 * 
 * @param cdnLocation URL base donde se encuentran los recursos
 * @returns Una colección de assets
 */
export function setupRandomAssets(cdnLocation:string):Asset[]{
    const ASSETS_URL = cdnLocation+"random/";
    
    // Assets de test, borrar cuando esté el backoffice
    const media = {
        "hexSelected":ASSETS_URL + "resources/hex-selected.png",
        "hexUnexplored":ASSETS_URL + "resources/hex-unexplored.png",
        "ui_ok":ASSETS_URL + "ui/icon-accept.svg",
        "ui_cancel":ASSETS_URL + "ui/icon-close.svg",
        "ui_warning":ASSETS_URL + "ui/icon-warning.svg",
        "ui_add":ASSETS_URL + "ui/icon-add.svg",
        "ui_delete":ASSETS_URL + "ui/icon-delete.svg",
        "iconSectionArea":ASSETS_URL + "resources/icon-section-area.svg",
        "iconSectionResources":ASSETS_URL + "resources/icon-section-resources.svg",
        "iconSectionTechnology":ASSETS_URL + "resources/icon-section-technologies.svg",
        "iconSectionWorld":ASSETS_URL + "resources/icon-section-world.svg",
        "iconSectionActivity":ASSETS_URL + "resources/icon-section-activities.svg",
        "iconSectionMessage":ASSETS_URL + "resources/icon-section-messages.svg",
        "iconbuild":ASSETS_URL + "resources/icon-build.svg",
        "iconresearch":ASSETS_URL + "resources/icon-research.svg",
        "icondismantle":ASSETS_URL + "resources/icon-dismantle.svg",
        "iconspy":ASSETS_URL + "resources/icon-spy.svg",
        "icontrade":ASSETS_URL + "resources/icon-trade.svg",
        "iconattack":ASSETS_URL + "resources/icon-attack.svg",
        "iconclaim":ASSETS_URL + "resources/icon-claim.svg",
        "iconexplore":ASSETS_URL + "resources/icon-explore.svg",
        "iconmessage":ASSETS_URL + "resources/icon-section-messages.svg",
        "cell-1":ASSETS_URL + "resources/water-1.png",
        "cell-2":ASSETS_URL + "resources/dirt-1.png",
        "cell-3":ASSETS_URL + "resources/dirt-2.png",
        "cell-4":ASSETS_URL + "resources/forest-1.png",
        "cell-5":ASSETS_URL + "resources/forest-2.png",
        "iconbuilding":ASSETS_URL + "resources/icon-building.svg",
        "iconcell":ASSETS_URL + "resources/icon-cell.svg",
        "iconplayers":ASSETS_URL + "resources/icon-players.svg",
        "iconMsgMessage":ASSETS_URL + "ui/icon-msg-message.svg",
        "iconMsgNotification":ASSETS_URL + "ui/icon-msg-notification.svg",
        "iconMsgReport":ASSETS_URL + "ui/icon-msg-report.svg",
        "texturestructureshop1":ASSETS_URL + "resources/texture-structure-shop1.svg",
        "structure1":ASSETS_URL + "images/structure-1.jpeg",
        "structure2":ASSETS_URL + "images/structure-2.jpeg",
        "structure3":ASSETS_URL + "images/structure-3.jpeg",
        "structure4":ASSETS_URL + "images/structure-4.jpeg",
        "structure5":ASSETS_URL + "images/structure-5.jpeg",
        "btex1":ASSETS_URL + "resources/building-1.png",
        "btex2":ASSETS_URL + "resources/building-2.png",
        "btex3":ASSETS_URL + "resources/building-3.png",
        "btex4":ASSETS_URL + "resources/building-4.png",
        "iconenergy":ASSETS_URL + "resources/icon-energy.svg",
        "iconsilver":ASSETS_URL + "resources/icon-silver.svg",
        "iconore":ASSETS_URL + "resources/icon-ore.svg",
        "icondiamond":ASSETS_URL + "resources/icon-diamond.svg",
        "energy":ASSETS_URL + "images/energy.jpeg",
        "silver":ASSETS_URL + "images/silver.jpeg",
        "ore":ASSETS_URL + "images/ore.jpeg",
        "diamond":ASSETS_URL + "images/diamond.jpeg",
        "photo1":ASSETS_URL + "images/pexels-photo-440731.jpeg",
        "photo2":ASSETS_URL + "images/pexels-photo-459728.jpeg",
        "photo3":ASSETS_URL + "images/solar-panel-array-power-sun-electricity-159397.jpeg",
        "homeBackground":ASSETS_URL + "images/home-background.png",
        "techBackground":ASSETS_URL + "images/tech-background.webp",
        "resourceBackground":ASSETS_URL + "images/resource-background.png",
        "messagingBackground":ASSETS_URL + "images/messaging-background.webp",
        "activityBackground":ASSETS_URL + "images/activity-background.webp",
        "tech1":ASSETS_URL + "images/tech-texture-1.svg",
        "tech2":ASSETS_URL + "images/tech-texture-2.svg",
        "tech3":ASSETS_URL + "images/tech-texture-3.svg",
        "tech4":ASSETS_URL + "images/tech-texture-4.svg",
        "tech5":ASSETS_URL + "images/tech-texture-5.svg",
        "tech6":ASSETS_URL + "images/tech-texture-6.svg",
        "tech7":ASSETS_URL + "images/tech-texture-7.svg",
        "userProfile1":ASSETS_URL + "images/user-profile-1.webp",
        "userProfile2":ASSETS_URL + "images/user-profile-2.webp",
        "userProfile3":ASSETS_URL + "images/user-profile-3.webp",
        "userProfile4":ASSETS_URL + "images/user-profile-4.webp",
        "userProfile5":ASSETS_URL + "images/user-profile-5.webp",
        "userProfile6":ASSETS_URL + "images/user-profile-6.jpg",
        "gameportrait-1":ASSETS_URL + "images/gameportrait-1.webp",
        "gameportrait-2":ASSETS_URL + "images/gameportrait-2.webp",
        "gameportrait-3":ASSETS_URL + "images/gameportrait-3.webp",
        "gameportrait-4":ASSETS_URL + "images/gameportrait-4.webp",
        "gameportrait-5":ASSETS_URL + "images/gameportrait-5.webp",
        "gameportrait-6":ASSETS_URL + "images/gameportrait-6.webp",
        "msgReportImage":ASSETS_URL + "images/image-messaging-report.webp",
        "msgMessageImage":ASSETS_URL + "images/image-messaging-message.png",
        "msgNotificationImage":ASSETS_URL + "images/image-messaging-notification.png",
        "imgUnknown":ASSETS_URL + "images/image-unknown.webp",
    }

    const assets = [
        createAsset('cell-texture-water','image',media['cell-1']),
        createAsset('cell-texture-dirt1','image',media['cell-2']),
        createAsset('cell-texture-dirt2','image',media['cell-3']),
        createAsset('cell-texture-forest1','image',media['cell-4']),
        createAsset('cell-texture-forest2','image',media['cell-5']),        
        createAsset('icon-building','image',media['iconbuilding']),
        createAsset('icon-cell','image',media['iconcell']),
       
        createAsset('placeable-texture-1','image',media['btex1']),
        createAsset('placeable-texture-2','image',media['btex2']),
        createAsset('placeable-texture-3','image',media['btex3']),
        createAsset('placeable-texture-4','image',media['btex4']),
        
        createAsset('structure-image-struct1','image',media['structure1']),
        createAsset('structure-image-struct2','image',media['structure2']),
        createAsset('structure-image-struct3','image',media['structure3']),
        createAsset('structure-image-struct4','image',media['structure4']),
        createAsset('structure-image-struct5','image',media['structure5']),
        createAsset('tech-texture-1','image',media['tech1']),
        createAsset('tech-texture-2','image',media['tech2']),
        createAsset('tech-texture-3','image',media['tech3']),
        createAsset('tech-texture-4','image',media['tech4']),
        createAsset('tech-texture-5','image',media['tech5']),
        createAsset('tech-texture-6','image',media['tech6']),
        createAsset('tech-texture-7','image',media['tech7']),
        createAsset('resource-icon-energy','image',media['iconenergy']),
        createAsset('resource-icon-silver','image',media['iconsilver']),
        createAsset('resource-icon-ore','image',media['iconore']),
        createAsset('resource-icon-diamond','image',media['icondiamond']),
        createAsset('resource-image-energy','image',media['energy']),
        createAsset('resource-image-silver','image',media['silver']),
        createAsset('resource-image-ore','image',media['ore']),
        createAsset('resource-image-diamond','image',media['diamond']),
        createAsset('image1','image',media['photo1']),
        createAsset('image2','image',media['photo2']),
        createAsset('image3','image',media['photo3']),
        createAsset('user-profile-1','image',media['userProfile1']),
        createAsset('user-profile-2','image',media['userProfile2']),
        createAsset('user-profile-3','image',media['userProfile3']),
        createAsset('user-profile-4','image',media['userProfile4']),
        createAsset('user-profile-5','image',media['userProfile5']),
        createAsset('user-profile-6','image',media['userProfile6']),
        createAsset('gameportrait-1','image',media['gameportrait-1']),
        createAsset('gameportrait-2','image',media['gameportrait-2']),
        createAsset('gameportrait-3','image',media['gameportrait-3']),
        createAsset('gameportrait-4','image',media['gameportrait-4']),
        createAsset('gameportrait-5','image',media['gameportrait-5']),
        createAsset('gameportrait-6','image',media['gameportrait-6']),
    ];

    return assets;
}

/**
 * Mapa con las descripciones de los assets estáticos
 */
export const ConstantAssetDescriptions:Record<string,string>[] = [
	{assetId:staticAssetKeys.UI_OK,text:"Icono aceptar"},
	{assetId:staticAssetKeys.UI_WARNING,text:"Icono advertencia"},
	{assetId:staticAssetKeys.UI_CANCEL,text:"Icono cancelar"},
	{assetId:staticAssetKeys.UI_ADD,text:"Icono añadir"},
	{assetId:staticAssetKeys.UI_DELETE,text:"Icono borrar"},
	{assetId:staticAssetKeys.ICON_BUILD,text:"Icono construccion"},
	{assetId:staticAssetKeys.ICON_DISMANTLE,text:"Icono  desmantelamiento"},
	{assetId:staticAssetKeys.ICON_SPY,text:"Icono espionaje"},
	{assetId:staticAssetKeys.ICON_TRADE,text:"Icono comercio"},
	{assetId:staticAssetKeys.ICON_ATTACK,text:"Icono ataque"},
	{assetId:staticAssetKeys.ICON_CLAIM,text:"Icono reclamar celda"},
	{assetId:staticAssetKeys.ICON_EXPLORE,text:"Icono explorar"},
	{assetId:staticAssetKeys.ICON_RESEARCH,text:"Icono investigar"},
	{assetId:staticAssetKeys.ICON_MESSAGE,text:"Icono mensaje"},
	{assetId:staticAssetKeys.HEX_SELECTED,text:"Textura celda seleccionada"},
	{assetId:staticAssetKeys.HEX_UNEXPLORED,text:"Textura celda no explorada"},
	{assetId:staticAssetKeys.ICON_SECTION_AREA,text:"Icono de la sección del jugador"},
	{assetId:staticAssetKeys.ICON_SECTION_RESOURCES,text:"Icono de la sección de recursos"},
	{assetId:staticAssetKeys.ICON_SECTION_TECHNOLOGY,text:"Icono de la sección de tecnología"},
	{assetId:staticAssetKeys.ICON_SECTION_WORLD,text:"Icono del mapa del mundo"},
	{assetId:staticAssetKeys.ICON_SECTION_ACTIVITIES,text:"Icono de la sección de actividades"},
	{assetId:staticAssetKeys.ICON_SECTION_MESSAGES,text:"Icono de la sección de mensajería"},
	{assetId:staticAssetKeys.ICON_PLAYERS,text:"Icono de jugadores"},
	{assetId:staticAssetKeys.ICON_MSG_MESSAGE,text:"Icono de envíar mensaje"},
	{assetId:staticAssetKeys.ICON_MSG_NOTIFICATION,text:"Icono de notificación de mensaje"},
	{assetId:staticAssetKeys.ICON_MSG_REPORT,text:"Icono de informe"},
	{assetId:staticAssetKeys.TECH_BACKGROUND,text:"Fondo de pantalla de la sección de tecnología"},
	{assetId:staticAssetKeys.HOME_BACKGROUND,text:"Fondo de pantalla del área del jugador"},
	{assetId:staticAssetKeys.RESOURCE_BACKGROUND,text:"Fondo de pantalla del área de recursos"},
	{assetId:staticAssetKeys.MESSAGING_BACKGROUND,text:"Fondo de pantalla de la sección de mensajería"},
	{assetId:staticAssetKeys.ACTIVITY_BACKGROUND,text:"Fondo de pantalla de la sección de actividades"},
	{assetId:staticAssetKeys.MESSAGING_MESSAGE ,text:"Imagen de portada del panel de mensaje de jugador"},
	{assetId:staticAssetKeys.MESSAGING_NOTIFICATION ,text:"Imagen de portada de notificación del sistema"},
	{assetId:staticAssetKeys.MESSAGING_REPORT ,text:"Imagen de portada de informe de misión"},
	{assetId:staticAssetKeys.UNKNOWN_IMAGE ,text:"Imagen no encontrada o ausente"}
];



export class AssetManager {
    private static assets:{[name:string]:Asset} = {};
    
    public static add(asset:Asset){
        AssetManager.assets[asset.id] = asset;
    }

    public static get(id:string){
        return AssetManager.assets[id];
    }
}

export function generateCSS(uiConfig:UIConfig):string {
    const template = `\
@font-face{\n
font-family:game-font;\n
    src:url('${process.env.CDN_URL}fonts/${uiConfig.uiControlFontFamily}');\n
}\n
:root{\n
\n        
    --ui-control-background-color:${uiConfig.uiControlBackgroundColor};\n
    --ui-control-foreground-color:${uiConfig.uiControlForegroundColor};\n
    --ui-control-background-color-brilliant: ${uiConfig.uiControlBackgroundColorBrilliant};\n
    --ui-control-background-secondary:${uiConfig.uiControlBackgroundSecondary};\n
    --ui-control-background-primary: ${uiConfig.uiControlBackgroundPrimary};\n
    --ui-control-font-family:'game-font';\n
    --ui-control-font-color:${uiConfig.uiControlFontColor};\n
    --ui-control-font-color-disabled:${uiConfig.uiControlFontColorDisabled};\n
    --ui-control-text-size:${uiConfig.uiControlTextSize};\n
    --ui-control-heading-size:${uiConfig.uiControlTextHeadingSize};\n
    --ui-control-shadow-color:${uiConfig.uiControlShadowColor};\n
    --ui-control-padding:${uiConfig.uiControlPadding};\n
    --ui-control-border-color: ${uiConfig.uiControlBorderColor};\n
    --ui-control-border-radius: ${uiConfig.uiControlBorderRadius};\n
    --ui-success:${uiConfig.uiSuccess};\n
    --ui-warning:${uiConfig.uiWarning};\n
    --ui-danger:${uiConfig.uiDanger};\n
    --ui-resource-flow-negative:${uiConfig.uiWarning};\n
    --ui-resource-flow-positive:${uiConfig.uiSuccess};\n
}`;

    return template;
}

export {
    staticAssetKeys as ConstantAssets
}