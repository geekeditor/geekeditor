import {get, set} from 'idb-keyval';

declare type FileSystemHandle = any
declare type FileSystemDirectoryHandle = any

class SharedFSAHandleCache {

    private _handles: {[key: string]: FileSystemHandle} = {};

    async get(id: string, permission?:boolean) {
        const handle = this._handles[id] || await get(id) as FileSystemDirectoryHandle;
        if (permission && handle && handle.kind === 'directory' && (await (handle as any).requestPermission({mode: 'readwrite'})) === 'granted') {
            this._handles[id] = handle;
            return handle;
        }

        return handle
    }

    async set(id: string, handle: FileSystemHandle, serialize?: boolean) {
        this._handles[id] = handle;
        if(serialize) {
            return set(id, handle);
        }
    }

    remove(id: string) {
        delete this._handles[id];
    }

}

const sharedFSAHandleCache = new SharedFSAHandleCache();
export default sharedFSAHandleCache;