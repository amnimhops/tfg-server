import { Asset } from "./monolyth";


export const ASSET_EMPTY:Asset = {
    id:'',
    type:'image',
    url:'',
    data:null
}

export const ConstantAssets = {
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

export function createAsset(id:string,type:'image'|'sound'|'text'|'json',url:string,data:any = null):Asset{
    return {id,type,url,data}
}

/**
 * URL desde donde se almacenan los recursos, convendrá parametrizar
 * este valor.
 */
const ASSETS_URL = 'http://localhost:3000/assets/';

export const assets = [
    createAsset(ConstantAssets.HEX_SELECTED,'image', ASSETS_URL + 'resources/hex-selected.png'),
    createAsset(ConstantAssets.HEX_UNEXPLORED,'image', ASSETS_URL + 'resources/hex-unexplored.png'),
    createAsset(ConstantAssets.UI_OK,'image', ASSETS_URL + 'ui/icon-accept.svg'),
    createAsset(ConstantAssets.UI_ADD,'image', ASSETS_URL + 'ui/icon-add.svg'),
    createAsset(ConstantAssets.UI_DELETE,'image', ASSETS_URL + 'ui/icon-delete.svg'),
    createAsset(ConstantAssets.UI_CANCEL,'image', ASSETS_URL + 'ui/icon-close.svg'),
    createAsset(ConstantAssets.UI_WARNING,'image', ASSETS_URL + 'ui/icon-warning.svg'),

    createAsset(ConstantAssets.ICON_DISMANTLE,'image', ASSETS_URL + 'resources/icon-dismantle.svg'),
    createAsset(ConstantAssets.ICON_BUILD,'image', ASSETS_URL + 'resources/icon-build.svg'),
    createAsset(ConstantAssets.ICON_RESEARCH,'image', ASSETS_URL + 'resources/icon-research.svg'),
    createAsset(ConstantAssets.ICON_SPY,'image', ASSETS_URL + 'resources/icon-spy.svg'),
    createAsset(ConstantAssets.ICON_TRADE,'image', ASSETS_URL + 'resources/icon-trade.svg'),
    createAsset(ConstantAssets.ICON_ATTACK,'image', ASSETS_URL + 'resources/icon-attack.svg'),
    createAsset(ConstantAssets.ICON_CLAIM,'image', ASSETS_URL + 'resources/icon-claim.svg'),
    createAsset(ConstantAssets.ICON_EXPLORE,'image', ASSETS_URL + 'resources/icon-explore.svg'),
    createAsset(ConstantAssets.ICON_MESSAGE,'image', ASSETS_URL + 'resources/icon-section-messages.svg'),

    createAsset(ConstantAssets.ICON_SECTION_AREA,'image', ASSETS_URL + 'resources/icon-section-area.svg'),
    createAsset(ConstantAssets.ICON_SECTION_RESOURCES,'image', ASSETS_URL + 'resources/icon-section-resources.svg'),
    createAsset(ConstantAssets.ICON_SECTION_TECHNOLOGY,'image', ASSETS_URL + 'resources/icon-section-technologies.svg'),
    createAsset(ConstantAssets.ICON_SECTION_WORLD,'image', ASSETS_URL + 'resources/icon-section-world.svg'),
    createAsset(ConstantAssets.ICON_SECTION_ACTIVITIES,'image', ASSETS_URL + 'resources/icon-section-activities.svg'),
    createAsset(ConstantAssets.ICON_SECTION_MESSAGES,'image', ASSETS_URL + 'resources/icon-section-messages.svg'),

    createAsset(ConstantAssets.TECH_BACKGROUND,'image',ASSETS_URL + 'images/tech-background.webp'),
    createAsset(ConstantAssets.RESOURCE_BACKGROUND,'image',ASSETS_URL + 'images/resource-background.png'),
    createAsset(ConstantAssets.HOME_BACKGROUND,'image',ASSETS_URL + 'images/home-background.png'),
    createAsset(ConstantAssets.MESSAGING_BACKGROUND,'image',ASSETS_URL + 'images/messaging-background.webp'),
    createAsset(ConstantAssets.ACTIVITY_BACKGROUND,'image',ASSETS_URL + 'images/activity-background.webp'),
];
// Assets de test, borrar cuando esté el backoffice
const media = {
    "hexSelected":"http://localhost:3000/assets/resources/hex-selected.png",
    "hexUnexplored":"http://localhost:3000/assets/resources/hex-unexplored.png",
    "ui_ok":"http://localhost:3000/assets/ui/icon-accept.svg",
    "ui_cancel":"http://localhost:3000/assets/ui/icon-close.svg",
    "ui_warning":"http://localhost:3000/assets/ui/icon-warning.svg",
    "ui_add":"http://localhost:3000/assets/ui/icon-add.svg",
    "ui_delete":"http://localhost:3000/assets/ui/icon-delete.svg",
    "iconSectionArea":"http://localhost:3000/assets/resources/icon-section-area.svg",
    "iconSectionResources":"http://localhost:3000/assets/resources/icon-section-resources.svg",
    "iconSectionTechnology":"http://localhost:3000/assets/resources/icon-section-technologies.svg",
    "iconSectionWorld":"http://localhost:3000/assets/resources/icon-section-world.svg",
    "iconSectionActivity":"http://localhost:3000/assets/resources/icon-section-activities.svg",
    "iconSectionMessage":"http://localhost:3000/assets/resources/icon-section-messages.svg",
    "iconbuild":"http://localhost:3000/assets/resources/icon-build.svg",
    "iconresearch":"http://localhost:3000/assets/resources/icon-research.svg",
    "icondismantle":"http://localhost:3000/assets/resources/icon-dismantle.svg",
    "iconspy":"http://localhost:3000/assets/resources/icon-spy.svg",
    "icontrade":"http://localhost:3000/assets/resources/icon-trade.svg",
    "iconattack":"http://localhost:3000/assets/resources/icon-attack.svg",
    "iconclaim":"http://localhost:3000/assets/resources/icon-claim.svg",
    "iconexplore":"http://localhost:3000/assets/resources/icon-explore.svg",
    "iconmessage":"http://localhost:3000/assets/resources/icon-section-messages.svg",
    "cell-1":"http://localhost:3000/assets/resources/water-1.png",
    "cell-2":"http://localhost:3000/assets/resources/dirt-1.png",
    "cell-3":"http://localhost:3000/assets/resources/dirt-2.png",
    "cell-4":"http://localhost:3000/assets/resources/forest-1.png",
    "cell-5":"http://localhost:3000/assets/resources/forest-2.png",
    "iconbuilding":"http://localhost:3000/assets/resources/icon-building.svg",
    "iconcell":"http://localhost:3000/assets/resources/icon-cell.svg",
    "iconplayers":"http://localhost:3000/assets/resources/icon-players.svg",
    "iconMsgMessage":"http://localhost:3000/assets/ui/icon-msg-message.svg",
    "iconMsgNotification":"http://localhost:3000/assets/ui/icon-msg-notification.svg",
    "iconMsgReport":"http://localhost:3000/assets/ui/icon-msg-report.svg",
    "texturestructureshop1":"http://localhost:3000/assets/resources/texture-structure-shop1.svg",
    "structure1":"http://localhost:3000/assets/images/structure-1.jpeg",
    "structure2":"http://localhost:3000/assets/images/structure-2.jpeg",
    "structure3":"http://localhost:3000/assets/images/structure-3.jpeg",
    "structure4":"http://localhost:3000/assets/images/structure-4.jpeg",
    "structure5":"http://localhost:3000/assets/images/structure-5.jpeg",
    "btex1":"http://localhost:3000/assets/resources/building-1.png",
    "btex2":"http://localhost:3000/assets/resources/building-2.png",
    "btex3":"http://localhost:3000/assets/resources/building-3.png",
    "btex4":"http://localhost:3000/assets/resources/building-4.png",
    "iconenergy":"http://localhost:3000/assets/resources/icon-energy.svg",
    "iconsilver":"http://localhost:3000/assets/resources/icon-silver.svg",
    "iconore":"http://localhost:3000/assets/resources/icon-ore.svg",
    "icondiamond":"http://localhost:3000/assets/resources/icon-diamond.svg",
    "energy":"http://localhost:3000/assets/images/energy.jpeg",
    "silver":"http://localhost:3000/assets/images/silver.jpeg",
    "ore":"http://localhost:3000/assets/images/ore.jpeg",
    "diamond":"http://localhost:3000/assets/images/diamond.jpeg",
    "photo1":"http://localhost:3000/assets/images/pexels-photo-440731.jpeg",
    "photo2":"http://localhost:3000/assets/images/pexels-photo-459728.jpeg",
    "photo3":"http://localhost:3000/assets/images/solar-panel-array-power-sun-electricity-159397.jpeg",
    "homeBackground":"http://localhost:3000/assets/images/home-background.png",
    "techBackground":"http://localhost:3000/assets/images/tech-background.webp",
    "resourceBackground":"http://localhost:3000/assets/images/resource-background.png",
    "messagingBackground":"http://localhost:3000/assets/images/messaging-background.webp",
    "activityBackground":"http://localhost:3000/assets/images/activity-background.webp",
    "tech1":"http://localhost:3000/assets/images/tech-texture-1.svg",
    "tech2":"http://localhost:3000/assets/images/tech-texture-2.svg",
    "tech3":"http://localhost:3000/assets/images/tech-texture-3.svg",
    "tech4":"http://localhost:3000/assets/images/tech-texture-4.svg",
    "tech5":"http://localhost:3000/assets/images/tech-texture-5.svg",
    "tech6":"http://localhost:3000/assets/images/tech-texture-6.svg",
    "tech7":"http://localhost:3000/assets/images/tech-texture-7.svg",
    "userProfile1":"http://localhost:3000/assets/images/user-profile-1.webp",
    "userProfile2":"http://localhost:3000/assets/images/user-profile-2.webp",
    "userProfile3":"http://localhost:3000/assets/images/user-profile-3.webp",
    "userProfile4":"http://localhost:3000/assets/images/user-profile-4.webp",
    "userProfile5":"http://localhost:3000/assets/images/user-profile-5.webp",
    "userProfile6":"http://localhost:3000/assets/images/user-profile-6.jpg",
    "msgReportImage":"http://localhost:3000/assets/images/image-messaging-report.webp",
    "msgMessageImage":"http://localhost:3000/assets/images/image-messaging-message.png",
    "msgNotificationImage":"http://localhost:3000/assets/images/image-messaging-notification.png",
    "imgUnknown":"http://localhost:3000/assets/images/image-unknown.webp",
}

assets.push(
    //createAsset(ConstantAssets.HEX_SELECTED,'image',media['hexSelected']),
    //createAsset(ConstantAssets.HEX_UNEXPLORED,'image',media['hexUnexplored']),
    //createAsset(ConstantAssets.UI_OK,'image',media['ui_ok']),
    //createAsset(ConstantAssets.UI_ADD,'image',media['ui_add']),
    //createAsset(ConstantAssets.UI_DELETE,'image',media['ui_delete']),
    //createAsset(ConstantAssets.UI_CANCEL,'image',media['ui_cancel']),
    //createAsset(ConstantAssets.UI_WARNING,'image',media['ui_warning']),
    //createAsset(ConstantAssets.ICON_DISMANTLE,'image',media['icondismantle']),
    //createAsset(ConstantAssets.ICON_BUILD,'image',media['iconbuild']),
    //createAsset(ConstantAssets.ICON_RESEARCH,'image',media['iconresearch']),
    //createAsset(ConstantAssets.ICON_SPY,'image',media['iconspy']),
    //createAsset(ConstantAssets.ICON_TRADE,'image',media['icontrade']),
    //createAsset(ConstantAssets.ICON_ATTACK,'image',media['iconattack']),
    //createAsset(ConstantAssets.ICON_CLAIM,'image',media['iconclaim']),
    //createAsset(ConstantAssets.ICON_EXPLORE,'image',media['iconexplore']),
    //createAsset(ConstantAssets.ICON_MESSAGE,'image',media['iconmessage']),
    //createAsset(ConstantAssets.ICON_SECTION_AREA,'image',media['iconSectionArea']),
    //createAsset(ConstantAssets.ICON_SECTION_RESOURCES,'image',media['iconSectionResources']),
    //createAsset(ConstantAssets.ICON_SECTION_TECHNOLOGY,'image',media['iconSectionTechnology']),
    //createAsset(ConstantAssets.ICON_SECTION_WORLD,'image',media['iconSectionWorld']),
    //createAsset(ConstantAssets.ICON_SECTION_ACTIVITIES,'image',media['iconSectionActivity']),
    //createAsset(ConstantAssets.ICON_SECTION_MESSAGES,'image',media['iconSectionMessage']),
    createAsset('cell-texture-water','image',media['cell-1']),
    createAsset('cell-texture-dirt1','image',media['cell-2']),
    createAsset('cell-texture-dirt2','image',media['cell-3']),
    createAsset('cell-texture-forest1','image',media['cell-4']),
    createAsset('cell-texture-forest2','image',media['cell-5']),        
    createAsset('icon-building','image',media['iconbuilding']),
    createAsset('icon-cell','image',media['iconcell']),
    createAsset(ConstantAssets.ICON_PLAYERS,'image',media['iconplayers']),
    createAsset(ConstantAssets.ICON_MSG_MESSAGE,'image',media['iconMsgMessage']),
    createAsset(ConstantAssets.ICON_MSG_NOTIFICATION,'image',media['iconMsgNotification']),
    createAsset(ConstantAssets.ICON_MSG_REPORT,'image',media['iconMsgReport']),

    createAsset(ConstantAssets.MESSAGING_MESSAGE,'image',media['msgMessageImage']),
    createAsset(ConstantAssets.MESSAGING_NOTIFICATION,'image',media['msgNotificationImage']),
    createAsset(ConstantAssets.MESSAGING_REPORT,'image',media['msgReportImage']),

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
    //createAsset(ConstantAssets.UNKNOWN_IMAGE,'image',media['imgUnknown'])
);