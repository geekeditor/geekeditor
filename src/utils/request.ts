import axios from "axios";
import { message } from "antd";
import { getToken, addSign } from "./auth";
import proxy from "../proxy";

const isDev = process.env.NODE_ENV === 'development';

const service = axios.create({
    baseURL: isDev ? `http://localhost:3002/api` :  `https://www.geekeditor.com/api`, // api的base_url
    // withCredentials: true,
    timeout: 10000,
    // withCredentials: false
});
service.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token && token.length > 0) {
            config.headers["authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            const res = response.data;
            if (res.code !== 0) {
                message.error(res.msg || "Server error")
                return Promise.reject({ error: new Error(res.msg || "Server error") });
            } else {
                return res;
            }
        }
        return response.data;
    },
    (error) => {
        console.log(error);
        const msg =
            error.response && error.response.data && error.response.data.msg;
        message.error(msg || error.message)

        if (error.response && error.response.status === 401) {

            const ACTION_AUTH_LOGOUT = proxy.get('ACTION_AUTH_LOGOUT');
            if (ACTION_AUTH_LOGOUT) {
                ACTION_AUTH_LOGOUT();
            }

        }

        return Promise.reject({ error });
    }
);

export function get<P, R>(uri: string, params?: P, headers?: any, config?: any): Promise<R> {
    return service
        .get(uri, {
            params: addSign(params || {}),
            headers: {
                ...headers
            },
            ...config
        })
        .then((response: any) => response.data);;
}

export function post<P, R>(uri: string, params?: P, headers?: any, config?: any): Promise<R> {
    return service
        .post(uri, addSign(params || {}), {
            headers: {
                ...headers
            },
            ...config,
        })
        .then((response: any) => response.data);
}

export function put<P, R>(uri: string, params?: any, headers?: any, config?: any): Promise<R> {
    return service
        .put(uri, addSign(params || {}), {
            headers: {
                ...headers
            },
            ...config,
        })
        .then((response: any) => response.data);
}

export function del<P, R>(uri: string, params: P, headers?: any, config?: any): Promise<R> {
    return service
        .delete(uri, {
            params: addSign(params || {}),
            headers: {
                ...headers
            },
            ...config,
        })
        .then((response: any) => response.data);
}



export default service;
