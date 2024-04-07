import { EDocsNodeType, EInitResultStatus, IDocsAssetLoadResult, IDocsAssetUploadResult, IDocsData, IDocsDataItem, IDocsImageHosting, IDocsIndex, IDocsIndexItem } from "../../../types/docs.d";
import { EPlatformType, IGithubDataItem, PlatformGithubRepoObj } from "../../../types/platform.d";
import GITHUB from '../../../api/github'
import { Base64 } from 'js-base64'
import md5 from 'blueimp-md5'
import { dataURItoBlob } from "../../../utils/utils";
import { findChildren, generateUniqueId, parseDocsIndex, removeChild, stringifyDocsIndex } from "./utils";





export default class GithubData implements IDocsData {
    protected _repo!: PlatformGithubRepoObj;
    protected _cache!: {
        [key: string]: any
    };
    protected _docsIndex!: IDocsIndex;
    protected _rootUrl!: string;
    protected _archiveUrl!: string;
    protected _docsIndexUrl!: string;
    protected _assetsUrl!: string;
    protected _docsUrl!: string;
    protected _uniqueID!: string;
    protected _imageHosting!: IDocsImageHosting | undefined;
    protected _base!: string;
    protected _treeUrl!: string;
    protected _filesUrl!: string;
    protected _rootHandleId!: string;
    protected _name!: string;
    // private _handles: {[key: string]: FileSystemDirectoryHandle|FileSystemFileHandle} = {}
    protected _rootHandle!: FileSystemDirectoryHandle;
    constructor(options: { repo: PlatformGithubRepoObj, imageHosting?: IDocsImageHosting }) {
        this._repo = { ...options.repo };
        this.initConfig(options);
        this._uniqueID = md5(this._rootUrl);
        this._imageHosting = options.imageHosting;
        this._cache = {};
    }

    protected initConfig(options: any) {
        this._rootUrl = `https://api.github.com/repos/${this._repo.owner.login}/${this._repo.name}/contents`;
        this._archiveUrl = `${this._rootUrl}`;
        this._docsIndexUrl = `${this._archiveUrl}/index.md`
        this._assetsUrl = `${this._archiveUrl}/assets`;
        this._docsUrl = `${this._archiveUrl}/docs`;
        this._base = `https://github.com/${this._repo.owner.login}/${this._repo.name}/tree/master`
    }

    protected get CRUD() {
        return GITHUB;
    }

    get title() {
        return `${this._repo.name}`
    }

    get platform() {
        return EPlatformType.EPlatformTypeGithub
    }

    get uniqueID() {
        return this._uniqueID;
    }

    get docsIndex() {
        const date = Date.now()
        if (!this._docsIndex) {
            this._docsIndex = {
                created: date,
                updated: date,
                version: 0,
                children: [],
                id: this.rootID,
                title: '',
                type: EDocsNodeType.EDocsNodeTypeDir
            }
        }

        this._docsIndex.updated = date;
        return this._docsIndex;
    }

    get rootID() {
        return "root";
    }

    init() {
        return this.fetchDocsIndex().then((c) => {
            if (!c) {
                return this.updateDocsIndex().then((c) => {
                    return !!c ? { status: EInitResultStatus.EInitResultStatusSuccess } : { status: EInitResultStatus.EInitResultStatusFail };
                })
            }
            return {
                status: EInitResultStatus.EInitResultStatusSuccess
            };
        })
    }

    async query(id: string, type: number, refresh?: boolean) {

        if (!this._docsIndex || refresh) {
            await this.fetchDocsIndex()
        }

        if (!this._docsIndex) {
            return []
        }

        if (id === this.rootID) {
            const children = this._docsIndex.children;
            return children.map(({ children, ...other }) => {
                return {
                    pid: id,
                    ...other,
                    extension: other.type === EDocsNodeType.EDocsNodeTypeDoc ? '.md' : '',
                    hasChildren: !!children && !!children.length
                }
            })
            // .sort((a, b) => {
            //     return (b.type - a.type) || (b.title > a.title ? -1 : b.title === a.title ? 0 : 1)
            // })
        }

        

        let list:IDocsDataItem[] = []
        const find = findChildren(id + '', this._docsIndex.children);
        if (find) {
            const children = find.children || [];
            list = children.map(({ children, ...other }) => {
                return {
                    pid: id,
                    ...other,
                    extension: other.type === EDocsNodeType.EDocsNodeTypeDoc ? '.md' : '',
                    hasChildren: !!children && !!children.length
                }
            })
            // .sort((a, b) => {
            //     return (b.type - a.type) || (b.title > a.title ? -1 : b.title === a.title ? 0 : 1)
            // })
        }

        // if (type === EDocsNodeType.EDocsNodeTypeDoc) {
        //     return this.getContent(id as string).then((value)=>{

        //         if(value && value.length) {
        //             value[0].children = list;
        //         }

        //         return value;

        //     });
        // }

        return list;
    }

    async find(id: string, refresh?: boolean) {
        if (!this._docsIndex || refresh) {
            await this.fetchDocsIndex()
        }

        if (!this._docsIndex) {
            return undefined
        }

        const find = findChildren(id + '', this._docsIndex.children);

        return find;
    }

    async loadContent(id: string, refresh?: boolean) {
        if (!this._docsIndex || refresh) {
            await this.fetchDocsIndex()
        }

        if (!this._docsIndex) {
            return []
        }

        

        let list:IDocsDataItem[] = []
        const find = findChildren(id + '', this._docsIndex.children);
        if (find) {
            const children = find.children || [];
            list = children.map(({ children, ...other }) => {
                return {
                    pid: id,
                    ...other,
                    extension: other.type === EDocsNodeType.EDocsNodeTypeDoc ? '.md' : '',
                    hasChildren: !!children && !!children.length
                }
            })
            // .sort((a, b) => {
            //     return (b.type - a.type) || (b.title > a.title ? -1 : b.title === a.title ? 0 : 1)
            // })
        }

        return this.getContent(id as string).then((value)=>{

            if(value && value.length) {
                value[0].children = list;
            }

            return value;

        });
    }

    add(doc: IDocsDataItem) {
        if (!doc.pid) {
            return Promise.resolve(undefined);
        }

        if (doc.type === EDocsNodeType.EDocsNodeTypeDoc) {
            return this.createDoc(doc).then((item) => {
                return !!item ? (item as IDocsDataItem).id : undefined
            })
        }

        return this.createDir(doc).then((item) => {
            return !!item ? (item as IDocsDataItem).id : undefined
        })
    }

    async update(doc: IDocsDataItem) {
        const id = doc.id as string;
        const newTitle = doc.title;
        const find = findChildren(id, this.docsIndex.children)
        if (find) {
            if (find.title === newTitle) {
                if (doc.type === EDocsNodeType.EDocsNodeTypeDoc) {
                    return this.updateContent(id, doc.content || '').then((c) => {
                        if (c) {
                            return id;
                        } else {
                            return this.getContent(id).then((c) => {
                                if (c) {
                                    return this.updateContent(id, doc.content || '').then((c) => {
                                        if (c) {
                                            return id
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            } else {
                find.title = newTitle;
                this.docsIndex.version = this.docsIndex.version + 1;
                const res = await this.updateDocsIndex()
                return res ? id : undefined;
            }
        }

    }

    async delete(doc: IDocsDataItem): Promise<boolean> {

        const docsIndex = this.docsIndex;
        const find = doc.pid === this.rootID ? docsIndex : findChildren(doc.pid, docsIndex.children);
        if (find) {
            const children = find.children || []
            const toDelIndex = children.findIndex((child) => child.id === doc.id && child.type === doc.type);
            if (toDelIndex !== -1) {
                const toDel = children[toDelIndex];
                
                if(doc.keepChildren) {
                    children.splice(toDelIndex, 1, ...(toDel.children||[]))
                } else {
                    children.splice(toDelIndex, 1);
                }
                docsIndex.version = docsIndex.version + 1;
                await this.updateDocsIndex();
                if (doc.type === EDocsNodeType.EDocsNodeTypeDoc) {
                    this.deleteContent(doc.id as string)
                }
            }

        }

        return true;
    }

    async move(doc: IDocsDataItem): Promise<boolean> {
        const find = removeChild(doc.id, this.docsIndex)
        if (find) {
            const { child: item } = find;
            const parent = doc.pid == this.rootID ? this.docsIndex : findChildren(doc.pid, this.docsIndex.children)
            if (parent) {
                parent.children = parent.children || []
                const toInsertBefore = parent.children.findIndex((child) => child.id === doc.before)
                const toInsertAfter = parent.children.findIndex((child) => child.id === doc.after)
                if (toInsertBefore !== -1) {
                    parent.children.splice(Math.max(toInsertBefore, 0), 0, item)
                } else if(toInsertAfter !== -1) {
                    parent.children.splice(Math.min(toInsertAfter+1, parent.children.length), 0, item)
                } else {
                    parent.children.push(item)
                }

                this.updateDocsIndex()
                return true
            }
        }
        return false
    }

    async queryConfigs(): Promise<IDocsDataItem[]> {

        const archiveUrl = this._archiveUrl;
        const token = this._repo.token;

        return this.CRUD.get(archiveUrl, token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const contents: IGithubDataItem[] = response.data;
                if (contents) {

                    const items: IDocsDataItem[] = [];
                    contents.forEach((c) => {
                        if (c.name !== 'index.md' && c.type === 'file') {
                            this._cache[c.path] = { sha: c.sha };

                            const name = c.name;
                            const match = name.match(/(.*)(\.[^\.]*$)/)
                            const item: IDocsDataItem = {
                                id: c.path,
                                pid: this.rootID,
                                title: match ? match[1] : name,
                                type: EDocsNodeType.EDocsNodeTypeDoc,
                                isConfig: true,
                                extension: match ? match[2] : ''
                            }
                            items.push(item);
                        }
                    })

                    return items;
                }
            }

            return []
        })
    }

    async loadConfig(id: string): Promise<IDocsDataItem[]> {
        const token = this._repo.token;
        const archiveUrl = this._archiveUrl;
        const contentPath = `${archiveUrl}/${id}`;
        return this.CRUD.get(contentPath, token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGithubDataItem = response.data;
                if (c) {
                    this._cache[id] = { sha: c.sha };
                    const match = id.match(/(.*)(\.[^\.]*$)/)
                    const item: IDocsDataItem = {
                        id,
                        title: match ? match[1] : id,
                        content: Base64.decode(c.content || ''),
                        type: EDocsNodeType.EDocsNodeTypeDoc,
                        isConfig: true,
                        extension: match ? match[2] : ''
                    }
                    return [item]
                }
            }
            return []
        })

    }

    async addConfig(doc: IDocsDataItem): Promise<string | undefined> {
        const archiveUrl = this._archiveUrl;
        const token = this._repo.token;
        const contentPath = `${doc.id || (doc.title + (doc.extension || ''))}` 
        const content = doc.content||''

        const response:any = await this.CRUD.put(`${archiveUrl}/${contentPath}`, token, {
            "message": "create action",
            "content": Base64.encode(content)
        })

        if(!response || response.status < 200 || response.status > 400) {
            return;
        }

        if (response.data && response.data.content) {
            const c = response.data.content;
            this._cache[contentPath] = { sha: c.sha };
        }

        return contentPath
    }

    async updateConfig(doc: IDocsDataItem) : Promise<string | undefined> {
        const archiveUrl = this._archiveUrl;
        const token = this._repo.token;
        const contentPath = `${doc.id || (doc.title + (doc.extension || ''))}` 
        const content = doc.content||''
        const item: IGithubDataItem = this._cache[contentPath];

        const response:any = await this.CRUD.put(`${archiveUrl}/${contentPath}`, token, {
            "message": "update action",
            "content": Base64.encode(content),
            "sha": item?.sha
        })

        if(!response || response.status < 200 || response.status > 400) {
            return;
        }

        if (response.data && response.data.content) {
            const c = response.data.content;
            this._cache[contentPath] = { sha: c.sha };
        }

        return contentPath
    }
    async deleteConfig(doc: IDocsDataItem) : Promise<boolean> {
        const archiveUrl = this._archiveUrl;
        const token = this._repo.token;
        const contentPath = `${doc.id}` 
        const item: IGithubDataItem = this._cache[contentPath];

        return this.CRUD.del(`${archiveUrl}/${contentPath}`, token, {
            "message": "delete action",
            "sha": item.sha
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                delete this._cache[contentPath];
                return true;
            }

            return this.CRUD.get(`${archiveUrl}/${contentPath}`, token).then((response: any) => {
                if (response.status >= 200 && response.status <= 400) {
                    const c: IGithubDataItem = response.data;
                    if (c) {
                        (this._cache[c.path] = {sha: c.sha});
                        return c;
                    }
                }
            }).then((c) => {
                if (c) {
                    return this.CRUD.del(`${archiveUrl}/${contentPath}`, token, {
                        "message": "delete action",
                        "sha": c.sha
                    }).then((response:any)=>{
                        if (response.status >= 200 && response.status <= 400) {
                            delete this._cache[c.path];
                            return true;
                        }

                        return false
                    })
                }
                return false
            })
        })
    }

    async uploadAsset(id: string, asset: File | Blob | string, assetName?: string): Promise<IDocsAssetUploadResult | undefined> {


        const file = (typeof asset === 'string' ? dataURItoBlob(asset) : asset) as File;

        if (this._imageHosting) {
            return this._imageHosting.uploadImage(file).then((value) => {
                if (value) {
                    return {
                        assetName: value.filename,
                        url: value.url,
                        file
                    }
                }
            });
        }

        if (!assetName) {
            const date = new Date();
            const match = file.type.match(/image\/(.*)/);
            const type = match ? match[1] : 'jpg'
            assetName = `${date.getTime()}-${(file.name || `image`)}`.replace(/\s/g, '-');
            const regex = new RegExp(`\.${type}$`)
            type && !regex.test(assetName) && (assetName = `${assetName}.${type}`);
        }

        const assetPath = `${assetName}`;

        const rootUrl = this._assetsUrl;
        const token = this._repo.token;


        return new Promise<undefined | { assetName: string; file: File | Blob }>((resolve) => {

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                if (e.target && e.target.result && typeof e.target.result === 'string') {
                    const content = e.target.result.split(',').pop() || '';
                    this.CRUD.put(`${rootUrl}/${assetPath}`, token, {
                        "message": "upload action",
                        "content": content
                    }).then((response: any) => {
                        if (response.status >= 200 && response.status <= 400) {
                            resolve({
                                assetName: assetName || '',
                                file
                            });
                        } else {
                            resolve(undefined);
                        }
                    }).catch(() => {
                        resolve(undefined);
                    })
                } else {
                    resolve(undefined)
                }
            }

        });

    }

    async loadAsset(id: string, assetName: string): Promise<IDocsAssetLoadResult | undefined> {
        const assetPath = `${assetName}`;

        const rootUrl = this._assetsUrl;
        const token = this._repo.token;

        const response: any = await this.CRUD.get(`${rootUrl}/${assetPath}`, token);

        if (response.status >= 200 && response.status <= 400) {
            const c: IGithubDataItem = response.data;
            if (c && c.content) {
                const match = assetName.match(/\.(jpg|jpeg|png|JPG|JEPG|PNG)$/)
                const dataURI = `data:image/${match ? match[1] : 'jpg'};base64,${c.content}`
                return {
                    assetName,
                    assetDoc: `${id}`,
                    assetRepo: this.uniqueID,
                    assetBase: this._base,
                    file: dataURItoBlob(dataURI)
                }
            }
        }

    }

    protected deleteContent(id: string) {
        const item: IGithubDataItem = this._cache[id];
        const token = this._repo.token;
        const contentPath = `${this._docsUrl}/${id}.md`;
        return this.CRUD.del(contentPath, token, {
            "message": "delete action",
            "sha": item.sha
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                delete this._cache[id];
                return true;
            }

            return this.getContent(id).then((c) => {
                if (c) {
                    const item: IGithubDataItem = this._cache[id];
                    return this.CRUD.del(contentPath, token, {
                        "message": "delete action",
                        "sha": item.sha
                    }).then((response: any) => {
                        if (response.status >= 200 && response.status <= 400) {
                            delete this._cache[id];
                            return true;
                        }

                        return false
                    })
                }
                return false
            })
        })
    }

    protected async updateContent(id: string, content: string) {
        const token = this._repo.token;
        const contentPath = `${this._docsUrl}/${id}.md`;
        const item: IGithubDataItem = this._cache[id];
        const response: any = await this.CRUD.put(contentPath, token, {
            "message": "update action",
            "content": Base64.encode(content),
            "sha": item?.sha
        })
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }
        const c = response.data.content;
        this._cache[id] = { sha: c.sha };
        return c;
    }

    protected async createDir(doc: IDocsDataItem): Promise<IDocsDataItem | undefined> {

        const parent = doc.pid === this.rootID ? this.docsIndex : findChildren(doc.pid, this.docsIndex.children);
        if (!parent) {
            return
        }

        const { title, pid, type } = doc;
        const children = parent.children || (parent.children = []);
        const id = generateUniqueId();
        const indexItem: IDocsIndexItem = {
            id,
            title,
            type
        }

        children.push(indexItem);
        this.docsIndex.version = this.docsIndex.version + 1;
        const res = this.updateDocsIndex()
        if (!res) {
            return;
        }

        const item: IDocsDataItem = {
            id: id,
            pid,
            title,
            type: EDocsNodeType.EDocsNodeTypeDir
        }
        return item;
    }

    protected async createDoc(doc: IDocsDataItem): Promise<IDocsDataItem | IGithubDataItem | undefined> {

        const token = this._repo.token;
        const parent = doc.pid === this.rootID ? this.docsIndex : findChildren(doc.pid, this.docsIndex.children);
        if (!parent) {
            return
        }

        const { content, title, pid, type } = doc;

        const children = parent.children || (parent.children = []);
        const id = generateUniqueId();
        const indexItem: IDocsIndexItem = {
            id,
            title,
            type
        }

        const contentPath = `${this._docsUrl}/${id}.md`;
        const response: any = await this.CRUD.put(contentPath, token, {
            "message": "create action",
            "content": Base64.encode(content || '')
        })
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }

        children.push(indexItem);
        this.docsIndex.version = this.docsIndex.version + 1;
        const res = await this.updateDocsIndex()
        if (!res) {
            return;
        }

        if (response.data && response.data.content) {
            const c = response.data.content;
            this._cache[id] = { sha: c.sha };
        }


        const item: IDocsDataItem = {
            pid,
            id,
            title,
            content,
            type: EDocsNodeType.EDocsNodeTypeDoc
        }
        return item;
    }

    protected getContent(id: string) {
        const token = this._repo.token;
        const contentPath = `${this._docsUrl}/${id}.md`;
        return this.CRUD.get(contentPath, token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGithubDataItem = response.data;
                if (c) {
                    this._cache[id] = { sha: c.sha };
                    const find = findChildren(id, this.docsIndex.children)
                    const item: IDocsDataItem = {
                        id,
                        title: find?.title || '',
                        content: Base64.decode(c.content || ''),
                        type: EDocsNodeType.EDocsNodeTypeDoc,
                        extension: ".md"
                    }
                    return [item]
                }
            }
            return []
        })
    }

    protected updateDocsIndex(): Promise<any | undefined> {

        const token = this._repo.token;

        const indPath = 'index.md'
        const docsIndex = this.docsIndex;
        docsIndex.updated = Date.now();
        const item: IGithubDataItem = this._cache[indPath];

        return this.CRUD.put(this._docsIndexUrl, token, {
            "message": "update action",
            "sha": item?.sha,
            "content": Base64.encode(stringifyDocsIndex(docsIndex))
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGithubDataItem = response.data.content;
                if (c) {
                    this._cache[c.path] = { sha: c.sha };
                    return c
                }
            }
        })
    }

    protected fetchDocsIndex(): Promise<any | undefined> {
        const token = this._repo.token;
        return this.CRUD.get(this._docsIndexUrl, token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGithubDataItem = response.data;
                if (c) {
                    this._cache[c.path] = { sha: c.sha };
                    try {
                        const docsIndex = parseDocsIndex(Base64.decode(c.content || ''))
                        if (docsIndex.version > this.docsIndex.version) {
                            this._docsIndex = docsIndex;
                        }
                    } catch (error) {

                    }
                }

                return c;
            }
        })
    }
}