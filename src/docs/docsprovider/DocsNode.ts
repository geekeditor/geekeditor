import { Unsubscribe } from "redux";
import { IDocsDAO, IDocsNode, IDocsNodeOptions, IDocsNodeStore, EDocsNodeType, IDocsNodeBase, EDocsNodeChangeType, IDocsDataItem, IDocsNodeData, EDocsProviderType, EDocsNodeBaseStatus, IDocsCreateDAO, IDocsSearchResult } from "../../types/docs.d";
import CustomEventEmitter from "../../utils/eventemitter";
import { DocsNodeStore } from "./store";
import { createNodeTempID, nodeTraversal } from './utils'
import { buildDocsNodes } from './utils';
import { debounce } from '../../utils/throttle';
import type MEditable from '@geekeditor/meditable'
import { MECursorState, MEOutlineItem } from "@geekeditor/meditable/dist/types/types/index.d";
import { MonacoBridge } from "../../types/monaco";
import factory from "./DocsProviderFactory";
import sharedEventBus from "../../utils/sharedEventBus";
import { MEStateScene } from "@geekeditor/meditable/dist/types/types/index.d";
import { flattenToOutline } from "@geekeditor/meditable";

export default class DocsNode extends CustomEventEmitter implements IDocsNode {


    static cacheNodes: Map<string, DocsNode> = new Map()
    static getNode(options: IDocsNodeOptions, ignoreDao?: boolean) {

        if (options.dao) {
            const id = options.dao.id;
            if (id) {
                const cacheId = `${options.dao.provider.providerID}${id}`
                const node = DocsNode.cacheNodes.get(cacheId);
                if (node) {
                    if (!ignoreDao) {
                        node.setDAO(options.dao);
                    }

                    if(options.data) {
                        node.setData(options.data);
                    }

                    return node;
                }
            }

        }

        const node = new DocsNode(options);
        if (options.dao) {
            const id = options.dao.id;
            if (id) {
                const cacheId = `${options.dao.provider.providerID}${id}`
                DocsNode.cacheNodes.set(cacheId, node);
            }

        }

        return node;
    }

    static removeCacheNode(dao?: IDocsDAO) {
        if (dao) {
            const cacheId = `${dao.provider.providerID}${dao.id}`
            DocsNode.cacheNodes.delete(cacheId);
        }
    }

    protected _tempID!: string;
    protected _nodeType!: EDocsNodeType;
    protected _deprecated!: boolean;
    protected _dao!: IDocsDAO | undefined;
    protected _store!: IDocsNodeStore;
    protected _children!: IDocsNodeBase[];
    protected _isChanged!: boolean;
    protected _isLoaded!: boolean;
    protected _isContentLoaded!: boolean;
    protected _isMounted!: boolean;
    protected _isRemoved!: boolean;
    protected _unsubcribe!: Unsubscribe;
    protected _lastTitle!: string;
    protected _isSaving!: boolean;
    protected _isLoading!: boolean;
    protected _isContentLoading!: boolean;
    protected _isRemoving!: boolean;
    protected _isMoving!: boolean;
    protected _dropType: number = 0;
    protected _editable!: MEditable;
    protected _monacoBridge!: MonacoBridge;
    protected _autoSaveFn!: Function;
    protected _wordCount!: number;
    protected _isConfig!: boolean;
    protected _hasChildren!: boolean;
    protected _outlines!: MEOutlineItem[];
    protected _activeOutlineId!: string|undefined;
    private _changeTimestamp!: number;
    private _cacheCursor!: MECursorState;
    private _status = EDocsNodeBaseStatus.EDocsNodeBaseStatusNone;
    constructor(options: IDocsNodeOptions) {
        super();
        const { nodeType, deprecated } = options;
        this._tempID = createNodeTempID();
        this._nodeType = nodeType;
        this._deprecated = !!deprecated;
        this._dao = options.dao;
        this._wordCount = 0;

        if (options.store) {
            this._store = options.store;
        } else {
            this._store = new DocsNodeStore({
                data: options.data,
            })
        }

        this._lastTitle = this._store.getTitle();
        this._unsubcribe = this._store.subscribe(() => {
            const title = this._store.getTitle();
            if (title !== this._lastTitle) {
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeTitle);
                this._lastTitle = title;
            }
        })


        this._store.setSaver(this);
        if (options.data) {
            this._store.setTitle(options.data.title || '');
            this._store.setContent(options.data.content || '');
            this._store.setExtension(options.data.extension || '');
            this._isConfig = !!options.data.isConfig;
            this._hasChildren = !!options.data.hasChildren;
        }
        this._children = [];
        this._isChanged = false;
        this._changeTimestamp = 0;
        this._isLoaded = false;
        this._isContentLoaded = false;
        this._isRemoved = false;
        this._isMounted = !!this.parentNode;
        this._isSaving = false;
        this._isRemoving = false;
        this._isContentLoading = false;
        this._autoSaveFn = debounce(() => {

            if (this._isChanged) {
                this.save()
            }

        }, 3 * 1000)
    }

    get wordCount() {
        return this._wordCount;
    }

    get editable() {
        return this._editable;
    }


    store() {
        return this._store;
    }
    setDAO(dao: IDocsDAO) {

        if (dao.parentNode && (!this._dao || (this._dao.parentNode !== dao.parentNode))) {

            setTimeout(() => {

                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeMounted);

            }, 0)

        }

        this._dao = dao;
    }
    setData(data: IDocsNodeData) {
        if(data.title !== undefined) {
            this._store.setTitle(data.title || '');
        }

        if(data.content !== undefined) {
            this._store.setContent(data.content || '');
        }

        if(data.extension !== undefined) {
            this._store.setExtension(data.extension || '');
        }

        if(data.isConfig !== undefined) {
            this._isConfig = !!data.isConfig;
        }

        if(data.hasChildren !== undefined) {
            this._hasChildren = !!data.hasChildren;
        }
    }
    onRemoved() {

    }
    offRemoved() {

    }
    async save() {
        if (this._dao && !this._isSaving) {
            const saveTimestamp = Date.now();

            if (this._editable) {
                const content = await this._editable.getContent();
                this._store.setContent(content)
            } else if (this._monacoBridge) {
                const content = this._monacoBridge.getContent();
                this._store.setContent(content)
            }

            const data: IDocsNodeData = this._nodeType === EDocsNodeType.EDocsNodeTypeDoc ? {
                content: this._store.getContent(),
                title: this._store.getTitle(),
                isConfig: this.isConfig,
                extension: this.extension
            } : {
                title: this._store.getTitle()
            }
            this._isSaving = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeSaving);
            return this._dao.save(data).then((success) => {
                this._isSaving = false;
                if (success && this._isChanged && saveTimestamp >= this._changeTimestamp) {
                    this._isChanged = false;
                    this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChanging);
                }
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeSaving);
                return success;
            });
        } else {
            // show select pop
            return Promise.resolve(false);
        }
    }

    notifyChangedHandlers(changeType: EDocsNodeChangeType) {
        this.trigger('change', changeType);
    }

    // IDocsNodeBase
    get id() {
        if (this._dao) {
            return this._dao.id;
        }
    }
    get isRoot() {
        return !this.id;
    }
    get providerID() {
        if (this._dao) {
            return this._dao.provider.providerID;
        }
        return ``;
    }
    get root(): IDocsNodeBase {
        const parentNode = this.parentNode
        return parentNode ? parentNode.root : this
    }
    get tempID() {
        return this._tempID;
    }
    get title() {
        return this._store.getTitle();
    }
    get extension() {
        return this._store.getExtension();
    }
    setTitle(title: string) {
        const originalTitle = this.title
        if (originalTitle !== title) {

            this._store.setTitle(title);
            this.save().then((success) => {

                if (success) {

                    this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeTitleSaved);

                } else {
                    this._store.setTitle(originalTitle)
                }

            });
        }
    }
    get content() {
        return this._store.getContent();
    }
    setEditable(editable: MEditable) {
        this._editable = editable;

        this._editable.setOption('linkClick', (href: string) => {

            let match;
            if (href.indexOf(window.location.host) !== -1 && (match = /(docs\/|)([^\?\/]*)\.md\?r=(.*)/.exec(href)) || (match = /(docs\/|)([^\?\/]*)\.md$/.exec(href))) {
                const providerId = match[3] || this.providerID
                const docId = match[2]
                factory.findDocument(providerId, docId).then((item) => {

                    if (item) {

                        const provider = factory.getProvider(providerId)
                        if (provider) {

                            const dao = (provider as IDocsCreateDAO).createDAO({
                                type: EDocsNodeType.EDocsNodeTypeDoc,
                                id: docId,
                                extension: ".md"
                            })
                            const node = DocsNode.getNode({
                                nodeType: EDocsNodeType.EDocsNodeTypeDoc,
                                dao,
                                data: {
                                    title: item.title,
                                    extension: ".md"
                                }
                            }, true);
                            sharedEventBus.trigger('onOpen', node)

                        }

                    }

                })
            } else if (/^http/.test(href)) {
                window.open(href, "_blank")
            }

            console.log(href)

        })

        this._editable.setOption('imageTransform', async (src: string) => {
            const match = /assets\/([^\?]*)/.exec(src)
            if (match) {
                const result = await this._dao?.loadAsset(match[1])
                if (result) {
                    return result.file
                }
            }

            return src;
        })

        this._editable.setOption('imageUpload', async (file: File | Blob) => {
            const result = await this._dao?.uploadAsset(file)
            if (result) {
                if (result.url) {
                    return result.url
                }

                return this.isConfig ? `assets/${result.assetName}?r=${this.providerID}` : `../assets/${result.assetName}?r=${this.providerID}`
            }

            return null
        })

        this._editable.setOption('pasteTransform', (content: { text: string; html: string }) => {

            let match;
            if (content.text && (match = content.text.match(/^\[(.*)\]\(docs\/(.*\.md\?r=.*)\)$/)) && !this.isConfig) {
                content.text = `[${match[1]}](${match[2]})`
            }

            return content;
        })

        editable.on("aftersetcontent", (event: string, currentScene: MEStateScene) => {
            this._wordCount = editable.getWordCount()
            this._outlines = flattenToOutline(currentScene.state);
            if(currentScene.cursor.scrollTopBlockId && currentScene.cursor.scrollTopBlockId !== 'root') {
                this._activeOutlineId = currentScene.cursor.scrollTopBlockId;
            }
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeContent);
            
        })

        if (this._isContentLoaded) {
            editable.setContent(this._store.getContent());
        }

        editable.on('contentchange', async (event: string, currentScene: MEStateScene) => {

            const content = await this._editable.getContent();
            const lastContent = this._store.getContent();
            if (content === lastContent) {
                return;
            }

            this._store.setContent(content)

            this._wordCount = editable.getWordCount();
            this._outlines = flattenToOutline(currentScene.state);
            if(currentScene.cursor.scrollTopBlockId && currentScene.cursor.scrollTopBlockId !== 'root') {
                this._activeOutlineId = currentScene.cursor.scrollTopBlockId;
            }
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeContent);

            if (!this._isChanged) {
                this._isChanged = true;
                this._changeTimestamp = Date.now();
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChanging)
            }
            this._autoSaveFn();
        })
        editable.on('scroll', (event: string, {scrollTopBlockId}: {scrollTopBlockId?: string})=>{
            if(scrollTopBlockId && scrollTopBlockId !== "root") {
                this._activeOutlineId = scrollTopBlockId;
            }
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeOutline);
        })


        this._editable.on('save', () => {
            this.save();
        })

        editable.actived = true;
        if (this._cacheCursor) {
            const { focusBlock, anchorBlock, focusBlockId, anchorBlockId, ...cursor } = this._cacheCursor;
            editable.setCursor(cursor)
        }

        this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeEditable)
    }
    setMonacoBridge(bridge: MonacoBridge) {
        this._monacoBridge = bridge;
        bridge.on("aftersetcontent", () => {
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeContent);
        })

        if (this._isContentLoaded) {
            bridge.setContent(this._store.getContent());
        }

        bridge.on('contentchange', () => {
            const content = this._monacoBridge.getContent();
            const lastContent = this._store.getContent();
            if (content === lastContent) {
                return;
            }

            this._store.setContent(content)

            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeContent);

            if (!this._isChanged) {
                this._isChanged = true;
                this._changeTimestamp = Date.now();
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChanging)
            }
            this._autoSaveFn();
        })

        bridge.on('save', () => {
            this.save()
        })
    }
    get nodeType() {
        return this._nodeType;
    }
    get deprecated() {
        return this._deprecated;
    }
    get providerType() {
        const dao = this._dao
        return dao ? dao.provider.providerType : EDocsProviderType.EDocsProviderTypeMemory
    }
    get isChanged() {
        return this._isChanged;
    }
    get isLoaded() {
        return this._isLoaded;
    }
    get isContentLoaded() {
        return this._isContentLoaded;
    }
    get isSaving() {
        return this._isSaving;
    }
    get isLoading() {
        return this._isLoading;
    }
    get isContentLoading() {
        return this._isContentLoading;
    }
    get isRemoving() {
        return this._isRemoving;
    }
    get isRemoved() {
        return this._isRemoved;
    }
    get isMoving() {
        return this._isMoving;
    }
    get isConfig() {
        return this._isConfig;
    }
    get hasChildren() {
        return !!this._children.length || (!this._isLoaded && this._hasChildren);
    }
    load(refresh?: boolean) {

        if (this.nodeType === EDocsNodeType.EDocsNodeTypeDoc && !this.supportEditing) {
            this._isLoaded = true;
        } else if (this._dao && !this._isLoading) {
            this._isLoading = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);
            return this._dao.load(refresh).then((arr) => {
                this._isLoading = false;
                let children: IDocsDataItem[] = arr
                this._isLoaded = true;

                if (this._dao) {
                    const nodes = buildDocsNodes(children, this, this._dao.provider);
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
                }

                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);
                return this._isLoaded;
            })
        }

        return Promise.resolve(true);
    }
    loadContent(refresh?: boolean) {

        if (!this.supportEditing) {
            this._isContentLoaded = true;
        } else if (this._dao && !this._isContentLoading) {
            this._isContentLoading = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);
            return this._dao.loadContent(refresh).then((arr) => {
                this._isContentLoading = false;
                let children: IDocsDataItem[] = []
                const node = (arr as IDocsDataItem[])[0];
                if (node) {
                    this._store.setContent(node.content || '');
                    if (this._editable) {
                        this._editable.setContent(node.content || '');
                    } else if (this._monacoBridge) {
                        this._monacoBridge.setContent(node.content || '');
                    }
                    this._store.setTitle(node.title || '');
                    this._store.setExtension(node.extension || '');
                    children = node.children || [];
                    this._isLoaded = true;
                    this._isContentLoaded = true;
                }

                if (this._dao) {
                    const nodes = buildDocsNodes(children, this, this._dao.provider);
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
                }



                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeLoading);

                return this._isLoaded;
            })
        }

        return Promise.resolve(true);
    }
    createNode(options: IDocsNodeOptions) {
        options.parentNode = this;
        if (this._dao) {
            return this._dao.createNode(options).then((node) => {
                if (node) {
                    this.notifyChangedHandlers(options.data?.isConfig ? EDocsNodeChangeType.EDocsNodeChangeTypeConfigs : EDocsNodeChangeType.EDocsNodeChangeTypeChildren)
                }
                return node;
            })
        }
        return Promise.resolve(undefined)
    }
    supportCreateNode(nodeType: EDocsNodeType) {
        return this._nodeType === EDocsNodeType.EDocsNodeTypeDir || nodeType === EDocsNodeType.EDocsNodeTypeDoc;
    }
    get supportReloadNode() {
        return true;
    }
    get supportEditing() {
        const extension = (this.extension || '').toLocaleLowerCase();
        return /\.(md|html|js|css)$/.test(extension)
    }
    get children() {
        return this._children;
    }
    get parentNode() {
        if (this._dao) {
            return this._dao.parentNode;
        }
    }
    set parentNode(parentNode: IDocsNodeBase|undefined) {
        if(this._dao) {
            this._dao.parentNode = parentNode;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeMounted);
        }
    }
    mount(atFirst?: boolean) {
        const parentNode = this.parentNode;
        if (!!parentNode) {
            const children = this.isConfig ? (parentNode.configs || []) : parentNode.children;
            const index = children.findIndex((c) => c.tempID === this.tempID)
            if (index === -1) {
                if (atFirst) {
                    children.unshift(this)
                } else {

                    const indexToInsert = children.findIndex((c) => {
                        return (c.title > this.title && c.nodeType === this.nodeType) || c.nodeType < this.nodeType
                    })

                    if (indexToInsert === 0) {
                        children.unshift(this);
                    } else if (indexToInsert === -1) {
                        children.push(this);
                    } else {
                        children.splice(indexToInsert, 0, this)
                    }
                }
                parentNode.notifyChangedHandlers(this.isConfig ? EDocsNodeChangeType.EDocsNodeChangeTypeConfigs : EDocsNodeChangeType.EDocsNodeChangeTypeChildren);
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeMounted);
            }
            this._isRemoved = false;

            if (!this.id) {
                return this.save().then((success) => {
                    if (!success) {
                        this.remove()
                    }

                    return success;
                })
            }

            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }
    remove(keepChildren?: boolean) {
        // delete from dao
        const parentNode = this.parentNode;
        if (this._dao && parentNode && !this._isRemoving) {
            this._isRemoving = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoving);
            return this._dao.delete(keepChildren).then((success) => {
                this._isRemoving = false;
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoving);
                if (success) {

                    const children = this.isConfig ? parentNode.configs || [] : parentNode.children;
                    const index = children.findIndex((c) => c.tempID === this.tempID)
                    if (index !== -1) {

                        if(keepChildren) {
                            const selfChidren = this.children || []
                            children.splice(index, 1, ...(selfChidren));
                            selfChidren.forEach((child)=>{
                                child.parentNode = parentNode;
                            })
                        } else {
                            children.splice(index, 1);
                        }
                        
                    }

                    parentNode.notifyChangedHandlers(this.isConfig ? EDocsNodeChangeType.EDocsNodeChangeTypeConfigs : EDocsNodeChangeType.EDocsNodeChangeTypeChildren);
                    this.afterRemoved();

                }

                return success;
            });
        }

        this.afterRemoved();
        return Promise.resolve(true);
    }
    moveTo(parentNode: IDocsNodeBase, toInsertBefore?: string, toInsertAfter?: string) {

        const lastParentNode = this.parentNode;
        if (this._dao) {
            this._isMoving = true;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeMoving);
            return this._dao.moveTo(parentNode, toInsertBefore, toInsertAfter).then((success) => {
                if (success) {

                    if (lastParentNode) {
                        const children = lastParentNode.children;
                        const index = children.findIndex((c) => c.tempID === this.tempID)
                        if (index !== -1) {
                            children.splice(index, 1);
                        }

                        lastParentNode.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChildren);
                    }

                    const children = parentNode.children;
                    const toInsertBeforeIndex = children.findIndex((c) => c.id === toInsertBefore)
                    const toInsertAfterIndex = children.findIndex((c) => c.id === toInsertAfter)
                    if (toInsertBeforeIndex !== -1) {
                        children.splice(Math.max(0, toInsertBeforeIndex), 0, this);
                    } else if (toInsertAfterIndex !== -1) {
                        children.splice(Math.min(toInsertAfterIndex + 1, children.length), 0, this);
                    } else {
                        children.push(this)
                    }

                    parentNode.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChildren);

                }

                this._isMoving = false;
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeMoving);

                return success
            })
        }


        return Promise.resolve(false);
    }
    onChanged(handler: (changeType: EDocsNodeChangeType) => void) {
        this.on('change', handler);
    }
    offChanged(handler: (changeType: EDocsNodeChangeType) => void) {
        this.off('change', handler);
    }

    destroy() {
        if (this._unsubcribe) {
            this._unsubcribe();
        }
    }

    actived() {
        // setTimeout(() => {
        //     if (this._editable) {
        //         this._editable.actived = true;
        //         if (this._cacheCursor) {
        //             const { focusBlock, anchorBlock, focusBlockId, anchorBlockId, ...cursor } = this._cacheCursor;
        //             this._editable.setCursor(cursor)
        //         }
        //     }
        // }, 10)
    }

    deactived() {
        if (this._editable) {
            this._cacheCursor = this._editable.getCursor();
            this._editable.actived = false;
        }
    }

    get canMove() {
        return true;
        // return this._nodeType === EDocsNodeType.EDocsNodeTypeDoc;
    }

    setStatus(status: EDocsNodeBaseStatus) {
        if (status !== this._status) {
            this._status = status;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeStatusChanged);
        }

    }
    get status() {
        return this._status;
    }

    get dropType() {
        return this._dropType;
    }

    set dropType(dropType: number) {
        if (dropType !== this._dropType) {
            this._dropType = dropType;
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeDropTargetChanged);
        }
    }

    get outlines() {
        return this._outlines;
    }
    
    get activeOutlineId() {
        return this._activeOutlineId;
    }

    scrollOutlineIntoView(id: string) {
        if(this._editable) {
            this._editable.scrollBlockIntoView(id);
        }
    }

    async find(filterRegex: RegExp) {
        const results:IDocsSearchResult[] = []

        if (this.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {

            const title = this.title;
            let match = title.match(filterRegex);
            if (match) {
                results.push({
                    node: this,
                    match
                })
            }

        }
        if(!this.isLoaded) {
            await this.load()
        }

        return this._children.reduce((promise, node)=>promise.then(async (results)=>{
            const subResult = await node.find(filterRegex);
            return results.concat(subResult);

        }), Promise.resolve(results))
    }

    private afterRemoved() {
        this._isRemoved = true;

        if (this._nodeType === EDocsNodeType.EDocsNodeTypeDir) {
            nodeTraversal(this, (node) => {
                const n = node as DocsNode;
                n.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved)
            })
        } else {
            this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved);
        }

        DocsNode.removeCacheNode(this._dao)
    }
}