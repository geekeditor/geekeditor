import { EDocsNodeType, EInitResultStatus, IDocsAssetLoadResult, IDocsAssetUploadResult, IDocsData, IDocsDataItem, IDocsImageHosting, IDocsIndexItem } from "../../../types/docs.d";
import { EPlatformType, IGitlabDataItem, IGitlabPutResData, IGitlabTreeItem, PlatformGitlabRepoObj } from "../../../types/platform.d";
import GITLAB, { BASET_HOST } from '../../../api/gitlab'
import { Base64 } from 'js-base64'
import md5 from 'blueimp-md5'
import { findChildren, generateDirectoryID, generateUniqueId, IndexSeperator, joinPath, parseDocsIndex, stringifyDocsIndex } from './utils';
import { dataURItoBlob } from "../../../utils/utils";
import sharedScene from "../../../utils/sharedScene";
import GithubData from './github'


export default class GitlabData extends GithubData {
    protected _branch = 'main';
    constructor(options: { repo: PlatformGitlabRepoObj, imageHosting?: IDocsImageHosting }) {
        super(options)
    }

    protected initConfig() {
        const repo = this._repo as PlatformGitlabRepoObj;
        this._treeUrl = `${BASET_HOST}/projects/${repo.id}/repository/tree`;
        this._filesUrl = `${BASET_HOST}/projects/${repo.id}/repository/files/`;
        this._rootUrl = this._filesUrl;
        this._archiveUrl = ``;
        this._docsIndexUrl = `index.md`
        this._assetsUrl = `assets`;
        this._docsUrl = `docs`;
        this._base = `https://gitlab.com/${this._repo.owner.login}/${this._repo.name}/-/tree/main`
    }

    protected get CRUD() {
        return GITLAB as any;
    }

    // get title() {
    //     return `GitLab[${this._repo.name}]`
    // }

    get platform() {
        return EPlatformType.EPlatformTypeGitlab
    }

    async queryConfigs(): Promise<IDocsDataItem[]> {

        const archiveUrl = this._archiveUrl || '/';
        const token = this._repo.token;

        return this.CRUD.get(this.getDirURL(archiveUrl), token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const contents: IGitlabTreeItem[] = response.data;
                if (contents) {

                    const items: IDocsDataItem[] = [];
                    contents.forEach((c) => {
                        if (c.name !== 'index.md' && c.type === 'blob') {

                            this._cache[c.path] = true;
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
        const contentPath = `${id}`;
        return this.CRUD.get(this.getFileURL(contentPath), token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabDataItem = response.data;
                if (c) {
                    this._cache[id] = true;
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
    
        const token = this._repo.token;
        const contentPath = `${doc.id || (doc.title + (doc.extension || ''))}` 
        const content = doc.content||''

        const response: any = await this.CRUD.put(this.getFileURL(contentPath), token, {
            "commit_message": "create action",
            "encoding": "base64",
            "content": Base64.encode(content||'')
        })
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }

        this._cache[contentPath] = true;

        return contentPath
    }

    async updateConfig(doc: IDocsDataItem) : Promise<string | undefined> {
        const token = this._repo.token;
        const contentPath = `${doc.id || (doc.title + (doc.extension || ''))}` 
        const content = doc.content||''
        const exist = this._cache[contentPath]

        const response: any = await this.CRUD.put(this.getFileURL(contentPath), token, {
            "commit_message": "update action",
            "encoding": "base64",
            "content": Base64.encode(content||'')
        }, exist)
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }

        this._cache[contentPath] = true;

        return contentPath
    }
    async deleteConfig(doc: IDocsDataItem) : Promise<boolean> {
        const contentPath = `${doc.title}${doc.extension||''}` 
        const token = this._repo.token;
        return GITLAB.del(this.getFileURL(contentPath), token, {
            "commit_message": "delete action",
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                delete this._cache[contentPath];
                return true;
            }

            return false
        })
    }

    async queryAssets(id: string):Promise<string[]> {

        const token = this._repo.token;

        const response:any = await this.CRUD.get(this.getDirURL(this._assetsUrl), token)

        if (response.status >= 200 && response.status <= 400) {
            const contents: IGitlabTreeItem[] = response.data;
            if (contents) {

                return contents.filter((c)=>c.type!=='tree').map((c)=>c.name);

            }
        }

        return []

    }

    async uploadAsset(id: string, asset: File|Blob|string, assetName?: string):Promise<IDocsAssetUploadResult|undefined> {
        const file = (typeof asset === 'string' ? dataURItoBlob(asset) : asset) as File;

        if (this._imageHosting) {
            return this._imageHosting.uploadImage(file).then((value)=>{
                if(value) {
                    return {
                        assetName: value.filename,
                        url: value.url,
                        file
                    }
                }
            });
        } 

        if(!assetName) {
            const date = new Date();
            const match = file.type.match(/image\/(.*)/);
            const type = match ? match[1] : 'jpg'
            assetName = `${date.getTime()}-${(file.name || `image`)}`.replace(/\s/g, '-');
            const regex = new RegExp(`\.${type}$`)
            type && !regex.test(assetName) && (assetName = `${assetName}.${type}`);
        }

        const assetPath = `${this._assetsUrl}/${assetName}`;
        
        const token = this._repo.token;
        
        
        return new Promise<undefined | { assetName: string; file: File | Blob }>((resolve) => {
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                if (e.target && e.target.result && typeof e.target.result === 'string') {
                    const content = e.target.result.split(',').pop() || '';
                    this.CRUD.put(this.getFileURL(assetPath), token, {
                        "commit_message": "upload action",
                        "encoding": "base64",
                        "content": content
                    }).then((response: any) => {
                        if (response.status >= 200 && response.status <= 400) {
                            resolve({
                                assetName: assetName||'',
                                file
                            });
                        } else {
                            resolve(undefined);
                        }
                    }).catch(()=>{
                        resolve(undefined);
                    })
                } else {
                    resolve(undefined)
                }
            }

        });

    }

    async loadAsset(id: string, assetName: string):Promise<IDocsAssetLoadResult|undefined> {
        const assetPath = `${this._assetsUrl}/${assetName}`;
        
        const token = this._repo.token;

        const response:any = await this.CRUD.get(this.getFileURL(assetPath), token);

        if (response.status >= 200 && response.status <= 400) {
            const c: IGitlabDataItem = response.data;
            if (c && c.content) {
                const match = assetName.match(/\.(jpg|jpeg|png|JPG|JEPG|PNG)$/)
                const dataURI = `data:image/${match?match[1]:'jpg'};base64,${c.content}`
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
        const contentPath = `${this._docsUrl}/${id}.md`;
        const token = this._repo.token;
        return GITLAB.del(this.getFileURL(contentPath), token, {
            "commit_message": "delete action",
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                delete this._cache[id];
                return true;
            }

            return false
        })
    }

    protected async updateContent(id: string, content: string) {
        const token = this._repo.token;
        const contentPath = `${this._docsUrl}/${id}.md`;
        const exist = this._cache[id];

        return this.CRUD.put(this.getFileURL(contentPath), token, {
            "commit_message": "update action",
            "encoding": "base64",
            "content": Base64.encode(content)
        }, exist).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabPutResData = response.data;
                if (c) {
                    return c
                }
            }
        })
    }

    protected async createDoc(doc: IDocsDataItem): Promise<IDocsDataItem | undefined> {

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
        const response: any = await this.CRUD.put(this.getFileURL(contentPath), token, {
            "commit_message": "create action",
            "encoding": "base64",
            "content": Base64.encode(content||'')
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

        this._cache[id] = true;

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
        return this.CRUD.get(this.getFileURL(contentPath), token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabDataItem = response.data;
                if (c) {
                    this._cache[id] = true;
                    const find = findChildren(id, this.docsIndex.children)

                    const item: IDocsDataItem = {
                        id,
                        title: find?.title||'',
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

    protected updateDocsIndex(): Promise<IDocsDataItem | undefined> {

        const token = this._repo.token;

        const indPath = this._docsIndexUrl;
        const docsIndex = this.docsIndex;
        docsIndex.updated = Date.now();
        const exist = this._cache[indPath];

        return  this.CRUD.put(this.getFileURL(indPath), token, {
            "commit_message": "update action",
            "encoding": "base64",
            "content": Base64.encode(stringifyDocsIndex(docsIndex))
        }, exist).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabPutResData = response.data;
                if (c) {
                    return c
                }
            }
        })
    }

    protected fetchDocsIndex(): Promise<IDocsDataItem | undefined> {
        const token = this._repo.token;
        const indPath = this._docsIndexUrl;
        return this.CRUD.get(this.getFileURL(indPath), token).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabDataItem = response.data;
                if (c) {
                    this._cache[indPath] = true;
                    
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

    private getFileURL(path: string) {
        return `${this._filesUrl}${encodeURIComponent(path)}?ref=${this._branch}&branch=${this._branch}`
    }

    private getDirURL(path: string) {
        return `${this._treeUrl}?ref=${this._branch}&path=${encodeURIComponent(path)}`
    }
}