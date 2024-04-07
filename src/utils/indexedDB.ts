export interface IIndexedDBOptions {
    dbName: string;
    version: number;
    onUpgrade: (database: IDBDatabase, version: number) => void;
}


export default class IndexedDB {

    private _options!: IIndexedDBOptions;
    private _database!: IDBDatabase;
    private _dbName!: string;
    private _version!: number;
    private _onUpgrade!: (database: IDBDatabase, version: number) => void;
    constructor(options: IIndexedDBOptions) {
        this._dbName = options.dbName;
        this._version = options.version;
        this._onUpgrade = options.onUpgrade;
    }

    open() {
        return new Promise<IDBDatabase>((resolve, reject) => {
            if (this._database) {
                resolve(this._database);
                return;
            }

            const request = indexedDB.open(this._dbName, this._version);
            request.onsuccess = () => {
                this._database = request.result
                resolve(this._database)
            }
            request.onerror = () => {
                reject(request.error)
            }
            request.onupgradeneeded = () => {
                this._onUpgrade(request.result, this._version);
            }
        })
    }

    close() {
        if (this._database) {
            this._database.close();
        }
    }


    private doAction(action: (database: IDBDatabase, resolve: (value: unknown) => void, reject: (reason?: any) => void) => void) {
        return new Promise((resolve, reject) => {
            this.open().then((database) => {
                action(database, resolve, reject);
            }).catch((error) => {
                reject(error);
            })
        })
    }

    queryAll(storeName: string, filter: (value: any) => boolean) {
        return this.doAction((database, resolve, reject) => {
            const transaction = database.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor();
            const arr: any[] = [];
            request.onerror = () => {
                reject(request.error);
            }
            request.onsuccess = (event: any) => {
                const cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (!!filter) {
                        filter(cursor.value) && arr.push(cursor.value);
                    } else {
                        arr.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(arr)
                }
            }
        })
    }

    query(key: any, storeName: string) {
        return this.doAction((database, resolve, reject) => {
            const transaction = database.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onerror = () => {
                reject(request.error);
            }
            request.onsuccess = (event: any) => {
                const value = event.target.result;
                resolve(value);
            }
        })
    }

    add(item: any, storeName: string) {
        return this.doAction((database, resolve, reject) => {
            const transaction = database.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);
            request.onsuccess = (event: any) => {
                resolve(event.target.result)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    del(key: any, storeName: string) {
        return this.doAction((database, resolve, reject) => {
            const transaction = database.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = (event: any) => {
                resolve(event.target.result)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    update(item: any, storeName: string, key?: any) {
        return this.doAction((database, resolve, reject) => {
            const transaction = database.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            request.onsuccess = (event: any) => {
                resolve(event.target.result)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }

}