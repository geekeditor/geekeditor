import { Action } from "redux";

export type User = {
    email: string;
    username: string;
}

export type Vip = {
    is_vip: boolean;
    code?: string;
    actived?: string;
    expire_in?: string;
}


export interface AuthAction extends Action<string> {
    payload: {
        user: User;
        vip: Vip;
        token?: string
    }
}