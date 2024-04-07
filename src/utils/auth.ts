import md5 from 'js-md5'
import Cookies from "js-cookie";

const key = md5('GN6ehwEONk#Qetjd9Oik@tkDor').toUpperCase();
const toQueryString = (obj: {[key: string]: string}) => Object.keys(obj)
    .filter(key => key !== 'sign' && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map(key => {
        if (/^http(s)?:\/\//.test(obj[key])) { return key + '=' + encodeURI(obj[key]) }
        else { return key + '=' + obj[key] }
    })
    .join('&')



export function addSign(params: {[key: string]: string}) {
    const t = `${Date.now()}`;
    params['t'] = t;

    let paramsStr = toQueryString(params);
    paramsStr += '&key=' + `${key}_${t}`
    const sign = md5(paramsStr).toUpperCase()
    params['sign'] = sign
    return params
}


const TokenKey = "x-token";

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token: string) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
    Cookies.remove(TokenKey);
}