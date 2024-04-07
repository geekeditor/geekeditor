import { EDocsNodeChangeType, EDocsNodeType, EDocsProviderType, IDocsCreateDAO, IDocsDAOOptions, IDocsData, IDocsDataItem, IDocsImageHosting, IDocsNodeBase, IDocsNodeData, IDocsNodeOptions, IDocsProviderOptions } from "../../types/docs.d";
import DocsNode from "./DocsNode";
import DocsProviderMemory from './DocsProviderMemory'
import { buildDocsNodes, nodeTraversal } from './utils'


export default class DocsProviderSerialization extends DocsProviderMemory implements IDocsCreateDAO {

    protected _data!: IDocsData;
    protected _imageHosting!: IDocsImageHosting | undefined;
    protected _type!: EDocsProviderType;
    protected _title!: string;

    constructor(options: IDocsProviderOptions) {
        super(options);
        this._isLoaded = false;
        this._data = options.data;
        this._imageHosting = options.image;
        this._type = options.type;
        this._title = options.title;
        this._id = options.id;
        this._providerID = options.providerID;
    }

    get title() {
        return this._title
    }

    get providerType() {
        return this._type;
    }

    get providerID() {
        return this._providerID;
    }

    createDAO(options: IDocsDAOOptions) {
        let id = options.id;
        let parentNode: IDocsNodeBase | undefined = options.parentNode;
        const type = options.type;
        const doc: IDocsDataItem = {
            title: '',
            pid: parentNode ? parentNode.id : '',
            type,
            isConfig: options.isConfig,
            extension: options.extension
        };
        const provider = this;

        return {
            get id() {
                return id;
            },
            get parentNode() {
                return parentNode;
            },
            set parentNode(parent: IDocsNodeBase|undefined) {
                parentNode = parent
            },
            load: (refresh?: boolean) => {
                if (!id) {
                    return Promise.reject([]);
                }

                return this._data.query(id, type, refresh);
            },
            loadContent: (refresh?: boolean) => {
                if (!id) {
                    return Promise.reject([]);
                }

                return doc.isConfig ? this._data.loadConfig(id) : this._data.loadContent(id, refresh);
            },
            save: (data: IDocsNodeData) => {
                const newData: IDocsDataItem = {
                    title: data.title === undefined ? doc.title || '' : data.title,
                    pid: doc.pid,
                    content: data.content === undefined ? doc.content || '' : data.content,
                    type,
                    cover: data.cover === undefined ? doc.cover || '' : data.cover,
                    extension: data.extension === undefined ? doc.extension || '' : data.extension
                }
                if (!id) {

                    if (!doc.pid) {
                        return Promise.reject()
                    }

                    return (doc.isConfig ? this._data.addConfig(newData) : this._data.add(newData)).then((key) => {
                        id = key;
                        doc.title = newData.title;
                        return true;
                    })
                }

                newData['id'] = id;
                return (doc.isConfig ? this._data.updateConfig(newData) : this._data.update(newData)).then((key) => {

                    if (!!key) {
                        doc.title = newData.title;
                        id = key
                    }

                    return !!key;
                })
            },
            delete: (keepChildren?: boolean) => {

                if (!id) {
                    parentNode = undefined;
                    return Promise.resolve(true)
                }

                const item = { id, type, title: '', pid: doc.pid, keepChildren }
                return (doc.isConfig ? this._data.deleteConfig(item) : this._data.delete(item)).then((success) => {
                    if (success) {
                        parentNode = undefined;
                    }

                    return success;
                });
            },
            moveTo: (newParent: IDocsNodeBase, toInsertBefore?: string, toInsertAfter?: string) => {
                if(!id) {
                    return Promise.resolve(false);
                }

                return this._data.move({pid: newParent.id, type, id, title: doc.title, before: toInsertBefore, after: toInsertAfter}).then((success: boolean) => {
                    if (success) {
                        parentNode = newParent;
                    }
                    return success;
                })
            },
            uploadAsset: (asset: File | Blob | string, assetName?: string) => {
                if (!id) {
                    return Promise.reject();
                }
                return this._data.uploadAsset(id, asset, assetName)
            },
            loadAsset: (assetName: string) => {
                if (!id) {
                    return Promise.reject();
                }

                return this._data.loadAsset(id, assetName)

            },
            createNode: (options: IDocsNodeOptions) => {
                return this.createNode(options)
            },
            get provider(){
                return provider;
            }
        };
    }

    // IDocsNodeBase
    get id() {
        return this._id;
    }
    load(refresh?: boolean) {
        this._isLoading = true;
        this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);
        return this._data.query(this.id, EDocsNodeType.EDocsNodeTypeDir, refresh).then((arr) => {
            this._isLoading = false;
            const nodes = buildDocsNodes(arr, this, this);
            const mergeNodes = nodes.map((n) => {

                const index = this._children.findIndex((c) => (c.id === n.id && c.nodeType === n.nodeType));
                if (index !== -1) {
                    const node = this._children[index];
                    this._children.splice(index, 1);
                    return node;
                }

                return n;
            })

            this._children.forEach((child) => {
                if (child.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
                    nodeTraversal(child, (node) => {
                        node.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved)
                    })
                } else {
                    child.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved);
                }
            })

            this._children = mergeNodes;
            this._isLoaded = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);
            return true;
        });
    }
    queryConfigs() {
        this._isConfigsLoading = true;
        this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeConfigsLoading);
        return this._data.queryConfigs().then((arr) => {
            this._isConfigsLoading = false;
            const nodes = buildDocsNodes(arr, this, this);
            const mergeNodes = nodes.map((n) => {

                const index = this._configs.findIndex((c) => (c.id === n.id && c.nodeType === n.nodeType));
                if (index !== -1) {
                    const node = this._configs[index];
                    this._configs.splice(index, 1);
                    return node;
                }

                return n;
            })

            this._configs.forEach((child) => {
                if (child.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
                    nodeTraversal(child, (node) => {
                        node.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved)
                    })
                } else {
                    child.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved);
                }
            })

            this._configs = mergeNodes;
            this._isConfigsLoaded = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeConfigsLoading);
            return true;
        });
    }
    createNode(options: IDocsNodeOptions) {
        const parentNode: IDocsNodeBase = options.parentNode || this;
        return new Promise<IDocsNodeBase | undefined>((resolve) => {
            const dao = this.createDAO({ type: options.nodeType, parentNode: parentNode, isConfig: options.data?.isConfig })
            const node: IDocsNodeBase = DocsNode.getNode({
                ...options, parentNode, dao
            });
            /*
            if (options.id === undefined) {
                dao.save(options.data || {}).then((value) => {
                    if (!!value) {
                        parentNode.addChild(node, true);
                        resolve(node);
                    } else {
                        resolve(undefined);
                    }
                }).catch(() => {
                    resolve(undefined);
                })
            } else {
                resolve(node);
            }*/

            // parentNode.addChild(node, true);
            // node.mount(true);
            resolve(node);
        }).then((node) => {
            if (node && parentNode === this) {
                this.notifyChangedHandlers( options.data?.isConfig ? EDocsNodeChangeType.EDocsNodeChangeTypeConfigs : EDocsNodeChangeType.EDocsNodeChangeTypeChildren)
            }

            return node;
        })
    }
    remove(): Promise<boolean> {

        const parentNode = this.parentNode;
        if (parentNode && parentNode.removeChild) {
            return parentNode.removeChild(this);
        }

        // Do nothing
        return Promise.resolve(false);
    }
    supportCreateNode(nodeType: EDocsNodeType) {
        return true;
    }
    get supportReloadNode() {
        return true;
    }
}