import { EDocsNodeType, EInitResultStatus, IDocsAssetLoadResult, IDocsAssetUploadResult, IDocsData, IDocsDataItem, IDocsImageHosting, IDocsIndexItem, IInitResult } from "../../../types/docs.d";
import { EPlatformType, ILocalDataItem } from "../../../types/platform.d";
import LOCAL from '../../../api/local'
import { seperator } from '../imagehosting/utils'
import { dataURItoBlob } from "../../../utils/utils";
import GithubData from './github'
import { findChildren, generateUniqueId, parseDocsIndex, stringifyDocsIndex } from "./utils";
export default class LocalData extends GithubData {
    constructor(options: { rootPath: string, imageHosting?: IDocsImageHosting }) {
        super({...options, repo: {} as any})
    }

    protected initConfig(options: any) {
        this._rootUrl = options.rootPath;
        this._archiveUrl = `${this._rootUrl}`;
        this._docsIndexUrl = `${this._archiveUrl}${seperator}index.md`
        this._assetsUrl = `${this._archiveUrl}${seperator}assets`;
        this._docsUrl = `${this._archiveUrl}${seperator}docs`;
        this._base = this._rootUrl;
    }

    protected get CRUD() {
        return LOCAL as any;
    }

    get title() {
        const comps = this._rootUrl.split(seperator);
        const name = comps.pop() || '';

        return `${name}`
    }

    get platform() {
        return EPlatformType.EPlatformTypeLocal
    }

    async queryConfigs(): Promise<IDocsDataItem[]> {
        const rootPath = this._rootUrl;
        return this.CRUD.get({
            path: rootPath,
            type: 'dir'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const contents: ILocalDataItem[] = response.data;
                if (contents) {

                    const items: IDocsDataItem[] = [];
                    contents.forEach((c) => {
                        if (c.name !== 'index.md' && c.type === 'blob') {
                            const path = c.fullpath.substr(rootPath.length + 1)
                            const name = c.name;
                            const match = name.match(/(.*)(\.[^\.]*$)/)
                            const item: IDocsDataItem = {
                                id: path,
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
        const contentPath = `${this._archiveUrl}${seperator}${id}`;
        return this.CRUD.get({
            path: contentPath,
            type: 'file'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: ILocalDataItem = response.data;
                if (c) {
                    const match = id.match(/(.*)(\.[^\.]*$)/)
                    const item: IDocsDataItem = {
                        id,
                        title: match ? match[1] : id,
                        content: c.content || '',
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
        return this.updateConfig(doc)
    }

    async updateConfig(doc: IDocsDataItem) : Promise<string | undefined> {
        const contentPath = `${this._archiveUrl}${seperator}${doc.id || (doc.title + (doc.extension || ''))}` 
        const content = doc.content||''

        const response = await this.CRUD.put({
            path: contentPath,
            type: 'file',
            content: content
        })
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }

        return contentPath
    }
    async deleteConfig(doc: IDocsDataItem) : Promise<boolean> {
        const contentPath = `${this._archiveUrl}${seperator}${doc.title}${doc.extension||''}` 
        return this.CRUD.del({
            path: contentPath,
            type: 'file'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                return true;
            }

            return false;
        })
    }

    async queryAssets(): Promise<string[]> {

        const response: any = await this.CRUD.get({
            path: this._assetsUrl,
            type: 'dir'
        })

        if (response.status >= 200 && response.status <= 400) {
            const contents: ILocalDataItem[] = response.data;
            if (contents) {

                return contents.filter((c) => c.type === 'file').map((c) => c.name);

            }
        }

        return []

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

        const assetPath = `${this._assetsUrl}${seperator}${assetName}`;


        return new Promise<undefined | { assetName: string; file: File | Blob }>((resolve) => {

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                if (e.target && e.target.result && typeof e.target.result === 'string') {
                    const content = e.target.result.split(',').pop() || '';
                    const source = (file as any).path || ''
                    return this.CRUD.put({
                        path: assetPath,
                        type: 'image',
                        content,
                        source
                    }).then((response: any) => {
                        if (response.status >= 200 && response.status <= 400) {
                            resolve({
                                assetName: assetName || '',
                                file
                            });
                        } else {
                            resolve(undefined)
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
        const assetPath = `${this._assetsUrl}${seperator}${assetName}`;

        const response: any = await this.CRUD.get({
            path: assetPath,
            type: 'file',
            base64: true
        });

        if (response.status >= 200 && response.status <= 400) {
            const c: ILocalDataItem = response.data;
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
        const contentPath = `${this._docsUrl}${seperator}${id}.md`;
        return this.CRUD.del({
            path: contentPath,
            type: 'file'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                return true;
            }

            return false;
        })
    }

    protected async updateContent(id: string, content: string) {
        const contentPath = `${this._docsUrl}${seperator}${id}.md`;
        const response: any = await this.CRUD.put({
            path: contentPath,
            type: 'file',
            content: content
        })
        if (!response || response.status < 200 || response.status > 400) {
            return;
        }

        const c: ILocalDataItem = response.data;
        return c;
    }

    protected async createDoc(doc: IDocsDataItem): Promise<IDocsDataItem | undefined> {

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

        const contentPath = `${this._docsUrl}${seperator}${id}.md`;
        const response = await this.CRUD.put({
            path: contentPath,
            type: 'file',
            content: content
        })

        if (response.status < 200 || response.status > 400 || !response.data) {
            return;
        }

        children.push(indexItem);
        this.docsIndex.version = this.docsIndex.version + 1;
        const res = await this.updateDocsIndex()
        if (!res) {
            return;
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
        const contentPath = `${this._docsUrl}${seperator}${id}.md`;
        return this.CRUD.get({
            path: contentPath,
            type: 'file'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: ILocalDataItem = response.data;
                if (c) {
                    const find = findChildren(id, this.docsIndex.children)
                    const item: IDocsDataItem = {
                        id,
                        title: find?.title||'',
                        content: c.content || '',
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

        const docsIndex = this.docsIndex;
        docsIndex.updated = Date.now();
        return this.CRUD.put({
            path: this._docsIndexUrl,
            type: 'file',
            content: stringifyDocsIndex(docsIndex)
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: ILocalDataItem = response.data.content;
                if (c) {
                    return c
                }
            }
        })
    }

    protected fetchDocsIndex(): Promise<IDocsDataItem | undefined> {
        return this.CRUD.get({
            path: this._docsIndexUrl,
            type: 'file'
        }).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: ILocalDataItem = response.data;
                if (c) {
                    try {
                        const docsIndex = parseDocsIndex((c.content || ''))
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