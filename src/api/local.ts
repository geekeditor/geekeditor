
// For electron app
const LOCAL = (window as any).LOCAL;
export function isLocal() {
    return !!LOCAL && LOCAL.local;
}

const LOCALAPI = {

    async get(params: {path: string; type: 'file'|'dir', base64?: boolean}) {
        return isLocal() ? LOCAL.get(params) : {status: -1};
    },

    async put(params: {path: string; content?: string; source?: string, type: 'file'|'dir'|'image'}, onUploadProgress?: (progressEvent: any) => void) {
        return isLocal() ? LOCAL.put(params) : {status: -1};
    },

    async del(params: {path: string; type: 'file'|'dir'}) {
        return isLocal() ? LOCAL.del(params) : {status: -1};
    },

    async rename(params: {path: string; newPath: string; type: 'file'|'dir'}) {
        return isLocal() ? LOCAL.rename(params) : {status: -1};
    },

    async transform(params: {path: string}) {
        return isLocal() ? LOCAL.transform(params) : {status: -1};
    }
}

export default LOCALAPI