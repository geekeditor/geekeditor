import {
    EDocsNodeType,
    EInitResultStatus,
    IDocsAssetLoadResult,
    IDocsAssetUploadResult,
    IDocsData,
    IDocsDataItem,
    IDocsImageHosting,
    IDocsIndexItem,
    IInitResult,
} from "../../../types/docs.d";
import { Base64 } from "js-base64";
import { EPlatformType, PlatformFSARepoObj } from "../../../types/platform.d";
import sharedFSAHandleCache from "../../../utils/sharedFSAHandleCache";
import { findChildren, generateDirectoryID, generateUniqueId, IndexSeperator, joinPath, parseDocsIndex, stringifyDocsIndex, writeFile } from "./utils";
import { dataURItoBlob } from "../../../utils/utils";
import GithubData from './github'

declare type FileSystemFileHandle = any;
declare type FileSystemDirectoryHandle = any;


// const isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows")
export default class FSAData extends GithubData {

    constructor(options: {
        repo: PlatformFSARepoObj;
        imageHosting?: IDocsImageHosting;
    }) {
        super({ repo: options.repo as any, imageHosting: options.imageHosting })
        this._uniqueID = this._rootHandleId;
    }



    protected initConfig(options: any) {

        this._rootHandleId = options.repo.fsaId;
        this._name = options.repo.name;
        this._base = `${this._name}`;

        this._rootUrl = this._rootHandleId;
        this._archiveUrl = ``;
        this._docsIndexUrl = `index.md`
        this._assetsUrl = `assets`;
        this._docsUrl = `docs`;
    }

    async init() {
        const handle = await this.getRootHandle();
        if (!handle) {
            return { status: EInitResultStatus.EInitResultStatusFail };
        }

        return { status: EInitResultStatus.EInitResultStatusSuccess };
    }

    get uniqueID() {
        return this._uniqueID;
    }

    get title() {
        return `${this._name}`;
    }

    get platform() {
        return EPlatformType.EPlatformTypeFSA;
    }

    get rootID() {
        return "root";
    }

    async queryConfigs(): Promise<IDocsDataItem[]> {
        const handle = await this.getRootHandle();
        if (!handle) {
            return []
        }

        const items: IDocsDataItem[] = [];
        for await (const entry of (handle as any).values()) {
            // console.log(entry.kind, entry.name);
            if (entry.name !== 'index.md' && entry.kind === 'file') {
                const subPath = `${entry.name}`
                const name = entry.name;
                const match = name.match(/(.*)(\.[^\.]*$)/)
                const item: IDocsDataItem = {
                    id: subPath,
                    pid: this.rootID,
                    title: match ? match[1] : name,
                    type: EDocsNodeType.EDocsNodeTypeDoc,
                    isConfig: true,
                    extension: match ? match[2] : ''
                }
                items.push(item);

                // this._handles[subPath] = entry;
                sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
            }
        }
        return items;
    }

    async loadConfig(id: string): Promise<IDocsDataItem[]> {
        let handle = await sharedFSAHandleCache.get(
            this.getPathHandleId(id)
        );
        if (!handle) {
            return [];
        }

        const file = await handle.getFile();
        const content = await file.text() || "";
        const find = findChildren(id, this.docsIndex.children)
        const item: IDocsDataItem = {
            id,
            title: find?.title || '',
            content,
            type: EDocsNodeType.EDocsNodeTypeDoc,
        };

        return [item];

    }

    async addConfig(doc: IDocsDataItem): Promise<string | undefined> {
        return this.updateConfig(doc)
    }

    async updateConfig(doc: IDocsDataItem): Promise<string | undefined> {
        const contentPath = `${doc.id || (doc.title + (doc.extension || ''))}`
        const content = doc.content || ''

        let contentHandle = await sharedFSAHandleCache.get(
            this.getPathHandleId(contentPath)
        );
        if (!contentHandle || contentHandle.kind !== "file") {
            const rootHandle = await this.getRootHandle()
            if (!rootHandle) {
                contentHandle = await rootHandle.getFileHandle(contentPath, {
                    create: true,
                });
                sharedFSAHandleCache.set(
                    this.getPathHandleId(contentPath),
                    contentHandle
                );

            }
        }

        if (contentHandle) {
            writeFile(contentHandle, content);
        }

        return contentPath
    }
    async deleteConfig(doc: IDocsDataItem): Promise<boolean> {
        const contentPath = `${doc.id}`
        const dirHandle = await this.getRootHandle();

        if (dirHandle) {
            await dirHandle.removeEntry(contentPath, { recursive: true });

            //TODO: remove handle cache

            return true;
        }

        return false;
    }

    async queryAssets(id: string): Promise<string[]> {
        const assets: string[] = [];
        const assetsHandle = await this.getAssetsHandle();
        const assetsPath = `assets`
        if (assetsHandle && assetsHandle.kind === "directory") {
            for await (const entry of (assetsHandle as any).values()) {
                // console.log(entry.kind, entry.name);
                const subPath = joinPath(assetsPath, entry.name);
                sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
                assets.push(entry.name);
            }
        }

        return assets;
    }

    async uploadAsset(
        id: string,
        asset: File | Blob | string,
        assetName?: string
    ): Promise<IDocsAssetUploadResult | undefined> {
        const file = (
            typeof asset === "string" ? dataURItoBlob(asset) : asset
        ) as File;

        if (this._imageHosting) {
            return this._imageHosting.uploadImage(file).then((value) => {
                if (value) {
                    return {
                        assetName: value.filename,
                        assetDoc: `${id}`,
                        assetRepo: this.uniqueID,
                        assetBase: this._base,
                        url: value?.url,
                        file,
                    };
                }
            });
        }

        if (!assetName) {
            const date = new Date();
            const match = file.type.match(/image\/(.*)/);
            const type = match ? match[1] : "jpg";
            assetName = `${date.getTime()}-${file.name || `image`}`.replace(/\s/g, '-');
            const regex = new RegExp(`\.${type}$`);
            type &&
                !regex.test(assetName) &&
                (assetName = `${assetName}.${type}`);
        }

        const assetsHandle = await this.getAssetsHandle();
        if (assetsHandle) {
            const assetHandle = await assetsHandle.getFileHandle(assetName, {
                create: true,
            });
            await writeFile(assetHandle, file);

            return {
                assetName: assetName,
                assetDoc: `${id}`,
                assetRepo: this.uniqueID,
                assetBase: this._base,
                file,
            };
        }
    }

    async loadAsset(
        id: string,
        assetName: string
    ): Promise<IDocsAssetLoadResult | undefined> {
        const assetHandle = await this.getAssetHandle(
            id as string,
            assetName
        );
        if (assetHandle) {
            const file = await assetHandle.getFile();
            return {
                assetName,
                assetDoc: `${id}`,
                assetRepo: this.uniqueID,
                assetBase: this._base,
                file,
            };
        }
    }

    protected async deleteContent(id: string) {
        const contentPath = `${this._docsUrl}/${id}.md`;
        const name = `${id}.md`
        const dirHandle = await this.getDocsHandle();

        if (dirHandle) {
            await dirHandle.removeEntry(name, { recursive: true });

            //TODO: remove handle cache

            return true;
        }

        return false;
    }

    protected async updateContent(id: string, content: string) {
        const contentHandle = (await this.getContentHandle(
            id
        )) as FileSystemFileHandle;
        if (!contentHandle) {
            return;
        }

        writeFile(contentHandle, content);
        return id;
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

        const contentHandle = (await this.getContentHandle(
            id
        )) as FileSystemFileHandle;
        if (!contentHandle) {
            return;
        }

        writeFile(contentHandle, content || '');

        children.push(indexItem);
        this.docsIndex.version = this.docsIndex.version + 1;
        const res = this.updateDocsIndex()
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

    protected async getContent(id: string) {

        let handle = (await this.getContentHandle(id)) as FileSystemFileHandle;
        if (!handle) {
            return [];
        }

        const file = await handle.getFile();
        const content = await file.text() || "";
        const find = findChildren(id, this.docsIndex.children)
        const item: IDocsDataItem = {
            id,
            title: find?.title || '',
            content,
            type: EDocsNodeType.EDocsNodeTypeDoc,
            extension: ".md"
        };

        return [item];
    }

    protected async updateDocsIndex() {

        const docsIndex = this.docsIndex;
        docsIndex.updated = Date.now();
        const handle = (await this.getDocsIndexHandle()) as FileSystemFileHandle;
        if (!handle) {
            return;
        }

        const content = stringifyDocsIndex(docsIndex);
        writeFile(handle, content);

        return {
            content
        }
    }

    protected async fetchDocsIndex() {

        const handle = (await this.getDocsIndexHandle()) as FileSystemFileHandle;
        if (!handle) {
            return;
        }

        const file = await handle.getFile();
        const content = await file.text() || "";

        try {
            const docsIndex = parseDocsIndex((content || ''))
            if (docsIndex.version > this.docsIndex.version) {
                this._docsIndex = docsIndex;
            }
        } catch (error) {

        }

        return {
            content
        }
    }

    private getPathHandleId(path: string) {
        return `${this._uniqueID}_${path}`;
    }

    private async getRootHandle() {
        const handle = (await sharedFSAHandleCache.get(
            this._rootHandleId,
            true
        )) as FileSystemDirectoryHandle;
        if (handle && handle.kind === "directory") {
            this._rootHandle = handle;
            this._name = handle.name;
            return handle;
        }
    }

    private async getDirectoryHandle(path: string) {
        const handle = ((await sharedFSAHandleCache.get(
            this.getPathHandleId(path),
            true
        )) ||
            this._rootHandle ||
            (await this.getRootHandle())) as FileSystemDirectoryHandle;
        if (!handle) {
            return;
        }

        return handle;
    }

    private async getDocsIndexHandle() {
        const docsIndexPath = `index.md`;
        let docsIndexHandle = await sharedFSAHandleCache.get(
            this.getPathHandleId(docsIndexPath)
        );
        if (docsIndexHandle && docsIndexHandle.kind === "file") {
            return docsIndexHandle;
        }

        const handle = await this.getRootHandle();
        if (handle && handle.kind === "directory") {
            for await (const entry of (handle as any).values()) {
                // console.log(entry.kind, entry.name);
                // const subPath = `${path}/${entry.name}`;
                // sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
                if (entry.name === docsIndexPath && entry.kind === "file") {
                    docsIndexHandle = entry;
                    sharedFSAHandleCache.set(this.getPathHandleId(docsIndexPath), entry);
                }
            }

            if (!docsIndexHandle) {
                docsIndexHandle = await handle.getFileHandle(docsIndexPath, {
                    create: true,
                });
                sharedFSAHandleCache.set(
                    this.getPathHandleId(docsIndexPath),
                    docsIndexHandle
                );
            }

            return docsIndexHandle;
        }
    }

    private async getAssetsHandle() {
        const assetsPath = `assets`;
        let assetsHandle = await sharedFSAHandleCache.get(
            this.getPathHandleId(assetsPath)
        );
        if (assetsHandle && assetsHandle.kind === "directory") {
            return assetsHandle;
        }

        const handle = await this.getRootHandle();
        if (handle && handle.kind === "directory") {
            for await (const entry of (handle as any).values()) {
                // console.log(entry.kind, entry.name);
                // const subPath = `${path}/${entry.name}`;
                // sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
                if (entry.name === "assets" && entry.kind === "directory") {
                    assetsHandle = entry;
                    sharedFSAHandleCache.set(this.getPathHandleId(assetsPath), entry);
                }
            }

            if (!assetsHandle) {
                assetsHandle = await handle.getDirectoryHandle("assets", {
                    create: true,
                });
                sharedFSAHandleCache.set(
                    this.getPathHandleId(assetsPath),
                    assetsHandle
                );
            }

            return assetsHandle;
        }
    }

    private async getAssetHandle(path: string, assetName: string) {
        const assetsPath = `assets`;
        const subPath = joinPath(assetsPath, assetName);
        let handle = await sharedFSAHandleCache.get(
            this.getPathHandleId(subPath)
        );
        if (!handle) {
            await this.queryAssets(``);

            handle = await sharedFSAHandleCache.get(
                this.getPathHandleId(subPath)
            );
        }

        return handle;
    }

    private async getDocsHandle() {
        const docsPath = `docs`;
        let docsHandle = await sharedFSAHandleCache.get(
            this.getPathHandleId(docsPath)
        );
        if (docsHandle && docsHandle.kind === "directory") {
            return docsHandle;
        }

        const handle = await this.getRootHandle();
        if (handle && handle.kind === "directory") {
            for await (const entry of (handle as any).values()) {
                // console.log(entry.kind, entry.name);
                // const subPath = `${path}/${entry.name}`;
                // sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
                if (entry.name === "docs" && entry.kind === "directory") {
                    docsHandle = entry;
                    sharedFSAHandleCache.set(this.getPathHandleId(docsPath), entry);
                }
            }

            if (!docsHandle) {
                docsHandle = await handle.getDirectoryHandle(docsPath, {
                    create: true,
                });
                sharedFSAHandleCache.set(
                    this.getPathHandleId(docsPath),
                    docsHandle
                );
            }

            return docsHandle;
        }
    }

    private async getContentHandle(path: string) {
        const name = `${path}.md`
        const contentPath = `${this._docsUrl}/${path}.md`;
        let contentHandle = await sharedFSAHandleCache.get(
            this.getPathHandleId(contentPath)
        );
        if (contentHandle && contentHandle.kind === "file") {
            return contentHandle;
        }

        const handle = await this.getDocsHandle();
        if (handle && handle.kind === "directory") {
            for await (const entry of (handle as any).values()) {
                // console.log(entry.kind, entry.name);
                const subPath = `${this._docsUrl}/${entry.name}`;
                sharedFSAHandleCache.set(this.getPathHandleId(subPath), entry);
                if (entry.name === name && entry.kind === "file") {
                    contentHandle = entry;
                }
            }

            if (!contentHandle) {
                contentHandle = await handle.getFileHandle(name, {
                    create: true,
                });
                sharedFSAHandleCache.set(
                    this.getPathHandleId(contentPath),
                    contentHandle
                );
            }

            return contentHandle;
        }
    }
}
