import { EDocsNodeType, EInitResultStatus, IDocsAssetLoadResult, IDocsAssetUploadResult, IDocsData, IDocsDataItem } from "../../../types/docs.d";
import IndexedDB from '../../../utils/indexedDB'
import { Base64 } from 'js-base64'
import md5 from 'blueimp-md5'
import { EPlatformType } from "../../../types/platform.d";
import { message } from "antd";
import i18n from "../../../i18n";
//@ts-ignore
import guideZh from "./guide/zh.md";
//@ts-ignore
import guideEn from "./guide/en.md";

export default class BuiltinData implements IDocsData {
    private _db!: IndexedDB;
    private _docsStoreName!: string;
    private _contentsStoreName!: string;
    private _token!: string;
    private _uniqueID!: string;
    constructor(options: { token: string }) {
        //TODO: init async
        this._db = new IndexedDB({
            dbName: 'BuiltinDB',
            version: 1,
            onUpgrade: (database, version) => {
                this.upgradeDatabase(database, version);
            }
        })
        this._docsStoreName = 'BuiltinDocs';
        this._contentsStoreName = 'BuiltinContents';
        this._token = options.token || '';
        this._uniqueID = md5(this._docsStoreName + this._contentsStoreName);
    }
    private upgradeDatabase(database: IDBDatabase, version: number) {
        if (!database.objectStoreNames.contains(this._docsStoreName)) {
            var store = database.createObjectStore(this._docsStoreName, { keyPath: 'id', autoIncrement: true })
            store.createIndex('idIndex', 'id', { unique: true })
            store.createIndex('titleIndex', 'title');
        }
        if (!database.objectStoreNames.contains(this._contentsStoreName)) {
            var store = database.createObjectStore(this._contentsStoreName, { keyPath: 'doc_id' })
            store.createIndex('docIdIndex', 'doc_id', { unique: true });
        }

    }

    get title() {
        return i18n.t("repo.builtinDocuments")
    }

    get platform() {
        return EPlatformType.EPlatformTypeBuiltin
    }

    get uniqueID() {
        return this._uniqueID;
    }

    init() {
        return this._db.open().then((database) => {
            return this.setDefaultDocs();
        }).then(()=>{
            return { status: EInitResultStatus.EInitResultStatusSuccess }
        })
    }

    get rootID() {
        return "root";
    }

    query(id: string, type: number) {
        return this._db.queryAll(this._docsStoreName, (value: any) => {
            return value.pid === id && this._token === value.token;
        }).then((arr: any) => {
            return (arr.reverse() as IDocsDataItem[]).map((item)=>{
                
                return {
                    ...item,
                    extension: item.type === EDocsNodeType.EDocsNodeTypeDoc ? ".md" : ""
                }

            });
        })
    }
    async find(id: string, refresh?: boolean) {
        const find = await this._db.query(id, this._docsStoreName) as IDocsDataItem;
        return find;
    }
    loadContent(id: string, refresh?: boolean | undefined) {
        return Promise.all([this._db.query(id, this._docsStoreName), this._db.query(id, this._contentsStoreName), this.query(id, EDocsNodeType.EDocsNodeTypeDoc)]).then((values: any) => {
            const value: any = {}
            Object.assign(value, values[0], { content: Base64.decode(values[1] ? values[1].content || '' : ''), children: values[2], extension: ".md" })
            return [value as IDocsDataItem]
        })
    }
    add(doc: IDocsDataItem) {
        const { content, ...other } = doc;
        return this._db.add({ ...other, token: this._token }, this._docsStoreName).then((key) => {

            if (doc.type === EDocsNodeType.EDocsNodeTypeDoc) {
                return this._db.update({ doc_id: key, content: Base64.encode(content || '') }, this._contentsStoreName)
            }

            return key;

        }).then((key) => {
            return key as string;
        })
    }
    update(doc: IDocsDataItem) {
        const id = doc.id;
        const { content, ...other } = doc;
        return this._db.update({ ...other, token: this._token }, this._docsStoreName, id).then((d) => {

            if (doc.type === EDocsNodeType.EDocsNodeTypeDoc) {
                return !!d && this._db.update({ doc_id: id, content: Base64.encode(content || '') }, this._contentsStoreName);
            }

            return !!d;
        }).then((content) => {
            return !!content ? id : undefined
        })
    }
    delete(doc: IDocsDataItem) {
        const { id, type } = doc
        if (!id) {
            return Promise.resolve(false)
        }
        if (type === EDocsNodeType.EDocsNodeTypeDir) {
            this.query(id, EDocsNodeType.EDocsNodeTypeDir).then((arr) => {
                arr.forEach((doc) => {
                    this._db.del(doc.id, this._docsStoreName).then(() => {
                        return this._db.del(doc.id, this._contentsStoreName);
                    }).then(() => {
                        return true;
                    });
                })
            })
        }

        return this._db.del(id, this._docsStoreName).then(() => {
            return this._db.del(id, this._contentsStoreName);
        }).then(() => {
            return true;
        });
    }
    async move(doc: IDocsDataItem): Promise<boolean> {
        const id = doc.id;
        const { content, before, ...other } = doc;
        return this._db.update({ ...other, token: this._token }, this._docsStoreName, id).then((d) => {
            return !!d;
        })
    }

    async queryConfigs(): Promise<IDocsDataItem[]> {
        return []
    }

    async loadConfig(id: string): Promise<IDocsDataItem[]> {
        return []
    }

    async addConfig(doc: IDocsDataItem): Promise<string | undefined> {
        return
    }

    async updateConfig(doc: IDocsDataItem) : Promise<string | undefined> {
        return
    }

    async deleteConfig(doc: IDocsDataItem) : Promise<boolean> {
        return false
    }

    async queryAssets(id: string): Promise<string[]> {
        return []
    }

    async uploadAsset(id: string, asset: File | Blob | string, assetName?: string): Promise<IDocsAssetUploadResult | undefined> {

        message.warn(i18n.t("repo.imageRepositoryRequired"));
        return;

    }

    async loadAsset(id: string, assetName: string): Promise<IDocsAssetLoadResult | undefined> {
        return;

    }
    private async setDefaultDocs() {

        const docInfo = (id: number, title: string) => {
            return {
                token: this._token,
                id,
                pid: "root",
                title,
                type: 0
            }
        }


        await this._db.update(docInfo(1, i18n.t("repo.guide")), this._docsStoreName, 2);
        await this._db.update({ doc_id: 1, content: Base64.encode(this.instructions) }, this._contentsStoreName);
        await this.query("1", EDocsNodeType.EDocsNodeTypeDoc).then((value)=>{
            if(value) {
                return this.delete({id: "1", type: EDocsNodeType.EDocsNodeTypeDoc, title: i18n.t("repo.guide")})
            }
        })
    }
    private get instructions() {
        return navigator.language.indexOf('zh') === 0 ? guideZh : guideEn;
    }
}