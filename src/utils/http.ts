import axios from "axios";

// chrome://flags/#same-site-by-default-cookies
export function get(uri: string, params?: any, headers?: any, config?: any) {
    return new Promise((resolve, reject) => {
        axios
            .get(uri, {
                params: params,
                headers: {
                    ...headers
                },
                ...config
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                console.log(error);
                // reject(error.data);
                resolve({ error: error })
            });
    });
}

export function post(uri: string, params?: any, headers?: any, config?: any) {
    return new Promise((resolve, reject) => {
        axios
            .post(uri, params, {
                headers: {
                    ...headers
                },
                ...config,
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                // reject(error.data);
                console.log(error);
                resolve({ error: error })
            });
    });
}

export function put(uri: string, params?: any, headers?: any, config?: any) {
    return new Promise((resolve, reject) => {
        axios
            .put(uri, params, {
                headers: {
                    ...headers
                },
                ...config,
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                // reject(error.data);
                console.log(error);
                resolve({ error: error })
            });
    });
}

export function del(uri: string, params: any, headers?: any, config?: any) {
    return new Promise((resolve, reject) => {
        axios
            .delete(uri, {
                params: {
                    ...params
                },
                headers: {
                    ...headers
                },
                ...config,
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                // reject(error.data);
                console.log(error);
                resolve({ error: error })
            });
    });
}

