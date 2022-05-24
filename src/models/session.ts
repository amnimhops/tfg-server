import { User, WithToken } from "./monolyth";

export function loadSession():WithToken<User>|null{
    const str = document.cookie;
    const pos = str.indexOf('_hex_session');
    if(pos >= 0){
        const data = str.substring(pos).split("=")[1].split(";")[0];
        const user = JSON.parse(window.atob(data)) as WithToken<User>;
        console.log(user)
        return user;
    }else{
        return null;
    }
    
}

export function storeSession(user:WithToken<User>){
    console.log("fu")
    document.cookie = " _hex_session="+window.btoa(JSON.stringify(user))+";"
}