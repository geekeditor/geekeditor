declare var chrome: any

const set = (source: any, key: string, value: any) => {
    if (source.set) {
        const param: any = {}
        param[key] = value
        source.set(param, () => { });
    } else {
        source[key] = value;
    }
}

const get = (source: any, key: string) => {
    if (source.get) {
        return new Promise<any>((resolve) => {
            source.get([key], (result: any) => {
                resolve(result[key])
            })
        });
    }

    return Promise.resolve(source[key]);
}

const remove = (source: any, key: string) => {
    if (source.remove) {
        source.remove([key, `${key}__expires__`], () => { });
    } else {
        delete source[key];
        delete source[`${key}__expires__`];
    }
}


class Storage {
    private props: any;
    private source: any;
    constructor(props?: {
        source?: any
    }) {
        this.props = props || {};
        this.source =
            this.props.source ||
            (typeof chrome !== "undefined" && typeof chrome.storage !== 'undefined' ? chrome.storage.local : (typeof localStorage !== 'undefined' ? localStorage : {}));
        this.initRun();
    }
    private initRun() {
        const reg = new RegExp("__expires__");
        let data = this.source;
        let list = Object.keys(data);
        if (list.length > 0) {
            list.map((key, v) => {
                if (!reg.test(key)) {
                    let now = Date.now();
                    let expires = data[`${key}__expires__`] || Date.now() + 1;
                    if (now >= expires) {
                        this.remove(key);
                    }
                }
                return key;
            });
        }
    }

    set(key: string, value: any, expired?: number) {
        let source = this.source;
        set(source, key, value);
        if (expired) {
            set(source, `${key}__expires__`, Date.now() + 1000 * 60 * expired);
            // source[ `${key}__expires__` ] = Date.now() + 1000 * 60 * expired;
        }
        return value;
    }

    async get(key: string) {
        const source = this.source,
            expired: any = await get(source, `${key}__expires__`) || Date.now() + 1;
        const now = Date.now();

        if (now >= expired) {
            this.remove(key);
            return;
        }

        return get(source, key);
    }

    async remove(key: string) {
        const source = this.source;
        const value = await get(source, key);
        remove(source, key);
        return value;
    }
}

export default Storage;