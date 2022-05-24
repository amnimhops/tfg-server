import { uuid } from "uuidv4";
import { ConstantAssets, getDefaultStaticAssets } from "./assets";
import { toMap } from "./functions";
import { Asset, UserInterface } from "./monolyth";

export function defaultUserInterface(cdnUrl:string):UserInterface{

    const defaultAssets = toMap(getDefaultStaticAssets(cdnUrl),asset => asset.id)

    return {
        style:{
            "uiControlFontFamily":"Verdana",
            "uiControlBackgroundColor":"#0b2e6b",
            "uiControlBackgroundColorBrilliant":"#005eff",
            "uiControlForegroundColor":"#194898",
            "uiControlFontColor":"white",
            "uiControlFontColorDanger":"#dd0a0a",
            "uiControlFontColorDisabled":"#a0a0a0",
            "uiControlTextSize":"1.0em",
            "uiControlTextHeadingSize":"1.5em",
            "uiControlBorderColor":"#293e61",
            "uiControlBorderRadius":"1px",
            "uiControlShadowColor":"#030e20",
            "uiControlBackgroundPrimary":"#b1a91a",
            "uiControlBackgroundSecondary":"#8f1323",
            "uiResourceFlowNegative":"",
            "uiResourceFlowPositive":"",
            "uiDanger":"",
            "uiWarning":"",
            "uiSuccess":"",
            "uiControlPadding":""
        },
        uiAssets:defaultAssets
    }
}