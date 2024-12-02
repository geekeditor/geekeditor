import { EDocsNodeType, EDocsProviderType, IDocsNodeBase, EDocsNodeChangeType, IDocsNodeOptions, IDocsProvider, EDocsNodeBaseStatus, IDocsSearchResult } from "../../types/docs.d";
import CustomEventEmitter from "../../utils/eventemitter";
import DocsNode from "./DocsNode";
import { createNodeTempID } from './utils'

export default class DocsProviderMemory extends CustomEventEmitter implements IDocsProvider {
    protected _children!: IDocsNodeBase[];
    protected _configs!: IDocsNodeBase[];
    protected _isLoaded!: boolean;
    protected _isLoading!: boolean;
    protected _isConfigsLoaded!: boolean;
    protected _isConfigsLoading!: boolean;
    protected _tempID!: string;
    protected _parentNode!: IDocsNodeBase | undefined;
    protected _id!: string;
    protected _providerID!: string;
    protected _status = EDocsNodeBaseStatus.EDocsNodeBaseStatusNone;

    constructor(options?: { parentNode?: IDocsNodeBase }) {
        super();
        options = options || {}
        this._children = [];
        this._configs = [];
        this._isLoaded = true;
        this._isConfigsLoaded = false;
        this._isConfigsLoading = false;
        this._tempID = createNodeTempID();
        this._parentNode = options.parentNode;
        this._providerID = `memory`;
    }

    get title() {
        return '临时'
    }

    setTitle() { }

    get content() {
        return ''
    }

    setEditable() { }

    get providerType() {
        return EDocsProviderType.EDocsProviderTypeMemory;
    }

    get providerID() {
        return this._providerID;
    }

    notifyChangedHandlers(changeType: EDocsNodeChangeType) {
        this.trigger('change', changeType);
    }

    // IDocsNodeBase
    get id() {
        return this._id;
    }
    get isRoot() {
        return true;
    }
    get root() {
        return this;
    }
    get tempID() {
        return this._tempID;
    }
    get nodeType() {
        return EDocsNodeType.EDocsNodeTypeDir;
    }
    get deprecated() {
        return false;
    }
    get isChanged() {
        return false
    }
    get isLoaded() {
        return this._isLoaded;
    }
    get isConfigsLoaded() {
        return this._isConfigsLoaded;
    }
    get isSaving() {
        return false;
    }
    get isLoading() {
        return this._isLoading;
    }
    get isConfigsLoading() {
        return this._isConfigsLoading;
    }
    get isRemoving() {
        return false;
    }
    get isMoving() {
        return false;
    }
    load() {
        return Promise.resolve(true);
    }
    queryConfigs() {
        return Promise.resolve(true);
    }
    save() {
        return Promise.resolve(true);
    }
    createNode(options: IDocsNodeOptions) {
        return new Promise<IDocsNodeBase | undefined>((resolve) => {
            const node: IDocsNodeBase = new DocsNode({ ...options, parentNode: this });
            // this.addChild(node);
            resolve(node)
        }).then((node) => {
            if (node) {
                this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChildren)
            }

            return node;
        })
    }
    supportCreateNode(nodeType: EDocsNodeType) {
        return nodeType === EDocsNodeType.EDocsNodeTypeDoc;
    }
    get supportReloadNode() {
        return false;
    }
    get children() {
        return this._children;
    }
    get configs() {
        return this._configs;
    }
    get parentNode() {
        return this._parentNode;
    }
    // setParentNode(parentNode: IDocsNodeBase | undefined) {
    //     // Do nothing
    // }
    // addChild(child: IDocsNodeBase, first?: boolean) {
    //     const index = this._children.findIndex((c) => c.tempID === child.tempID)
    //     if (index === -1) {
    //         if (first) {
    //             this._children.unshift(child)
    //         } else {
    //             this._children.push(child);
    //         }
    //     }
    //     child.setParentNode(this);
    // }
    mount(atFirst?: boolean) {
        // Do nothing
        return Promise.resolve(true);
    }
    remove() {
        // Do nothing
        return Promise.resolve(false);
    }
    moveTo(parentNode: IDocsNodeBase, toInsertBefore?: string|number) {
        return Promise.resolve(false);
    }
    onChanged(handler: (changeType: EDocsNodeChangeType) => void) {
        this.on('change', handler);
    }
    offChanged(handler: (changeType: EDocsNodeChangeType) => void) {
        this.off('change', handler);
    }

    destroy() {

    }

    actived() {

    }
    
    deactived() {

    }

    get canMove() {
        return false;
    }

    get hasChildren() {
        return !!this._children.length;
    }

    setStatus(status: EDocsNodeBaseStatus) {
        this._status = status;
    }
    get status() {
        return this._status;
    }

    async find(filterRegex: RegExp) {
        const results:IDocsSearchResult[] = []
        if(!this.isLoaded) {
            await this.load()
        }

        return this._children.reduce((promise, node)=>promise.then(async (results)=>{
            const subResult = await node.find(filterRegex);
            return results.concat(subResult);

        }), Promise.resolve(results))
    }
}