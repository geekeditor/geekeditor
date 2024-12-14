import { EDocsNodeBaseStatus, EDocsNodeChangeType, EDocsNodeType, IDocsNodeBase } from "../types/docs.d";
import sharedEventBus from "./sharedEventBus";

class SharedClipboard {

    private _node!: IDocsNodeBase | null;
    toCopy(node: IDocsNodeBase) {
        this.reset(node, EDocsNodeBaseStatus.EDocsNodeBaseStatusCopy)
    }

    toCut(node: IDocsNodeBase) {
        this.reset(node, EDocsNodeBaseStatus.EDocsNodeBaseStatusCut)
    }

    canPasteTo(node?: IDocsNodeBase) {
        if(!node) return false;
        
        if (this._node && !node.isConfig) {
            const children = node.children || [];

            const hasNode = children.find((n) => n === this._node)
            return !hasNode;
        }

        return false;
    }

    async pasteTo(node: IDocsNodeBase) {
        if (this._node) {
            const nodeType = EDocsNodeType.EDocsNodeTypeDoc;
            if(!node.isLoaded) {
                await node.load()
            } else if (!node.isContentLoaded && node.loadContent) {
                await node.loadContent()
            }
            
            const children = node.children;

            if (!this.canPasteTo(node)) {
                return;
            }

            if (!this._node.isContentLoaded && this._node.loadContent) {
                await this._node.loadContent()
            }


            let title = this._node.title;
            let content = this._node.content;
            let extension = this._node.extension;
            const index = children.findIndex((n) => n.title === title && n.nodeType === nodeType);
            if (index !== -1) {
                title = `${title}_${Date.now()}`
            }

            return node.createNode({
                nodeType: nodeType,
                parentNode: node,
                data: {
                    title,
                    content,
                    extension
                }
            }).then((n) => {
                if (n) {
                    n.mount().then((success) => {
                        if (success) {


                            if (this._node) {
                                if (this._node.status === EDocsNodeBaseStatus.EDocsNodeBaseStatusCut) {
                                    this._node.remove().finally(()=>{
                                        this._node = null;
                                    });
                                }
                            }


                        }
                    })
                }
                return n;
            })
        }
    }

    async transform(node: IDocsNodeBase, open?: boolean) {
        const parentNode = node.parentNode;
        const nodeType = node.nodeType;
        if (parentNode && EDocsNodeType.EDocsNodeTypeDoc == nodeType && node.deprecated) {
            await node.load()
            let title = node.title;
            let content = node.content;

            return parentNode.createNode({
                nodeType: nodeType,
                parentNode: parentNode,
                data: {
                    title,
                    content
                }
            }).then((n) => {
                if (n) {
                    return node.remove().then((success) => {
                        if (success) {


                            return n.mount()


                        }

                        return success
                    }).then((success)=>{
                        if(success && open) {
                            sharedEventBus.trigger('onOpen', n)
                        }

                        return success;
                    })
                }

                return false;
            })
        }

        return Promise.resolve(false);

    }

    clear() {
        if (this._node) {
            this._node.setStatus(EDocsNodeBaseStatus.EDocsNodeBaseStatusNone);
            this._node.offChanged(this.onNodeChanged);
        }

        this._node = null;
    }

    private onNodeChanged(changeType: EDocsNodeChangeType) {
        if(changeType === EDocsNodeChangeType.EDocsNodeChangeTypeRemoved) {
            if(this._node) {
                this._node.offChanged(this.onNodeChanged);
                this._node = null;
            }
        }
    }

    private reset(node: IDocsNodeBase, status: EDocsNodeBaseStatus) {
        if (node !== this._node || (this._node && status !== this._node.status)) {

            this.clear();

            this._node = node;

            if (node) {
                node.setStatus(status)

                node.onChanged(this.onNodeChanged)
            }

        }
    }

}

const sharedClipboard = new SharedClipboard();
export default sharedClipboard;