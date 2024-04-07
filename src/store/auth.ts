import { AuthAction, User, Vip } from '../types/auth';
import { removeToken, setToken } from '../utils/auth';


export const ACTION_TYPE_AUTH_LOGIN = "ACTION_TYPE_AUTH_LOGIN"
export const ACTION_TYPE_AUTH_LOGOUT = "ACTION_TYPE_AUTH_LOGOUT"
export const ACTION_TYPE_AUTH_BIND_VIP = "ACTION_TYPE_AUTH_BIND_VIP"

export const ACTION_AUTH_LOGIN = (user: User, vip: Vip, token?: string) => {
    return {
        type: ACTION_TYPE_AUTH_LOGIN,
        payload: {
            user,
            vip,
            token
        }
    }
}

export const ACTION_AUTH_BIND_VIP = ( vip: Vip) => {
    return {
        type: ACTION_TYPE_AUTH_BIND_VIP,
        payload: {
            vip
        }
    }
}

export const ACTION_AUTH_LOGOUT = () => {
    return {
        type: ACTION_TYPE_AUTH_LOGOUT,
        payload: {
        }
    }
}

const authState: {
    logined: boolean;
    user?: User;
    vip?: Vip;
} = {
    logined: false
}

export default function auth(state = authState, action: AuthAction) {

    switch (action.type) {
        case ACTION_TYPE_AUTH_LOGIN:
            state.logined = true;
            state.user = action.payload.user;
            state.vip = action.payload.vip;

            if(action.payload.token) {
                setToken(action.payload.token)
            }
            
            return { ...state };
        case ACTION_TYPE_AUTH_LOGOUT:
            removeToken()
            return { logined: false }

        case ACTION_TYPE_AUTH_BIND_VIP: 
            state.vip = action.payload.vip
            return {...state}
        default:
            return state;
    }

}