import React, { Component } from "react"
import "./DocsNodesBar.less"
import { EDocsNodeChangeType, EDocsNodeType, IDocsNodeBase } from "../types/docs.d"
import DocsNode from './DocsNode'
import DocsNodeFolder from "./DocsNodeFolder"
import { LoadingOutlined } from "@ant-design/icons";
import { message } from "antd"
import i18n from "../i18n"

function findDropTarget(children: IDocsNodeBase[]): { node: IDocsNodeBase, index: number } | undefined {
    let find: { node: IDocsNodeBase, index: number } | undefined = undefined;
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.dropType) {
            find = { node: child, index: i };
        } else if (child.children) {
            find = findDropTarget(child.children)
        }

        if (find) {
            break;
        }
    }

    return find;
}

function clearDropTarget(children: IDocsNodeBase[]) {
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.dropType) {
            child.dropType = 0;
        } else if (child.children) {
            clearDropTarget(child.children)
        }
    }
}

function contains(children: IDocsNodeBase[], node: IDocsNodeBase): boolean {
    return children.some((child: IDocsNodeBase)=>{

        return child.id === node.id || (child.children && contains(child.children, node));

    })
}
export default class DocsBar extends Component<{
    onOpen: (node: IDocsNodeBase) => void;
    root: IDocsNodeBase;
    defaultActiveNode?: IDocsNodeBase | undefined;
    wrapClassName?: string;
    onActiveNode?: (node: IDocsNodeBase) => void;
    onSetFilterNode?: (node: IDocsNodeBase) => void;
    hideOps?: boolean;
    onlyFolder?: boolean;
    showRoot?: boolean;
}, {
    activeNode: IDocsNodeBase | undefined;
    presentation: boolean
}>{

    private lastDragOverTarget!: HTMLElement | null;
    private scroller!: HTMLDivElement | null;
    private readonly MIME_TYPE = 'application/geekeditor-doc';
    constructor(props: any) {
        super(props)
        this.state = {
            activeNode: props.defaultActiveNode || props.root,
            presentation: false
        }
    }

    onActiveNode = (node: IDocsNodeBase) => {
        this.setState({
            activeNode: node
        })

        if (this.props.onActiveNode) {
            this.props.onActiveNode(node);
        }
    }

    onActiveRoot = () => {
        this.onActiveNode(this.props.root);
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading) {
            this.forceUpdate()
        } else if (type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren) {
            this.forceUpdate()
        }
    }

    onDrop = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (this.lastDragOverTarget) {
            this.lastDragOverTarget.classList.toggle('dragging-over', false);
            this.lastDragOverTarget = null;
        }

        const dataTransfer = event.dataTransfer;
        if (dataTransfer) {

            const movingId = dataTransfer.getData(this.MIME_TYPE);
            if (movingId) {

                this.onAddNodeDroping(movingId)

            }

        }
    }

    onAddNodeDroping = async (movingId: string) => {

        const { root } = this.props

        const movingNode = DocsNode.dropNodeMap[movingId];
        if (!movingNode) {
            return
        }




        //TODO: find drop target
        const find = findDropTarget(root.root.children)
        if (!find) {
            return
        }

        const type = find.node.dropType;
        clearDropTarget(root.root.children)
        const toInsertBefore = type === 1 ? find.node.id : undefined
        const toInsertAfter = type === 3 ? find.node.id : undefined
        const parentNode = type === 2 ? find.node : find.node.parentNode
        const toInsertIndex = find.index
        const children = find.node.parentNode?.children || []
        const hasIndex = children.findIndex((n) => n === movingNode)
        if (hasIndex === toInsertIndex || !parentNode) {
            return;
        }

        if(contains(movingNode.children||[], parentNode) || (parentNode.nodeType === EDocsNodeType.EDocsNodeTypeDoc && movingNode.nodeType === EDocsNodeType.EDocsNodeTypeDir)) {
            message.warning(i18n.t("repo.moveFail"))
            return;
        }



        if (movingNode.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
            await movingNode.load()
        }

        movingNode.moveTo(parentNode, toInsertBefore, toInsertAfter).then((success) => {
            if (!success) {
                message.error(i18n.t("repo.saveFail"));
            }
        })
    }

    onDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

    }

    onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const target = (event.target as Element).closest(`.docs-node__folder`) as HTMLElement;
        if (!target) {
            return;
        }

        if (this.lastDragOverTarget === target) {
            return;
        }

        if (this.lastDragOverTarget) {
            this.lastDragOverTarget.classList.toggle('dragging-over', false);
        }

        target.classList.toggle('dragging-over', true);
        this.lastDragOverTarget = target;

    }

    onDragLeave = (event: React.DragEvent) => {
        if (this.lastDragOverTarget) {
            this.lastDragOverTarget.classList.toggle('dragging-over', false);
            this.lastDragOverTarget = null;
        }
    }

    onScroll = (event: React.UIEvent) => {
        if (this.scroller) {
            this.setState({
                presentation: this.scroller.scrollTop > 4
            })
        }

    }

    componentDidMount() {
        const { root } = this.props;
        root.onChanged(this.onNodeChanged);
        if (root.children.length && !this.state.activeNode) {
            this.setState({
                activeNode: root.children[0]
            })
        }
    }

    componentWillUnmount() {
        const { root } = this.props;
        root.offChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps: any) {

        if (prevProps.root !== this.props.root) {

            if (prevProps.root) {
                prevProps.root.offChanged(this.onNodeChanged);
            }

            this.props.root.onChanged(this.onNodeChanged);

        }


    }



    render() {
        const { onOpen, showRoot, root, onSetFilterNode } = this.props;
        const hideOps = this.props.hideOps;
        const onlyFolder = this.props.onlyFolder;
        const nodes = root.children;
        const { activeNode, presentation } = this.state;
        const wrapClassName = this.props.wrapClassName || '';
        const isLoading = root.isLoading;
        // const Nodes = nodes.map((node)=>{
        //     return <DocsNode onlyFolder={!!onlyFolder} hideOps={!!hideOps} key={node.tempID} node={node} activeNode={activeNode} onActiveNode={this.onActiveNode} onOpen={onOpen}/>
        // })

        return (
            <div className="docs-nodes-bar-wrap">
                <div className={presentation ? "docs-nodes-bar-presentation" : ""}></div>
                <div ref={(ref) => this.scroller = ref} className={["docs-nodes-bar", wrapClassName].join(" ")} onScroll={this.onScroll} onClick={this.onActiveRoot} onDrop={this.onDrop} onDragEnter={this.onDragEnter} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave}>

                    {isLoading && !showRoot && !nodes.length && <div className="docs-nodes-bar__loading"><LoadingOutlined /></div>}
                    {/* {Nodes} */}
                    {!!onlyFolder ? <DocsNodeFolder noHeader={!showRoot} hideOps={!!hideOps} key={root.tempID} node={root} activeNode={activeNode} onActiveNode={this.onActiveNode} /> :
                        <DocsNode noHeader={!showRoot} hideOps={!!hideOps} key={root.tempID} node={root} activeNode={activeNode} onSetFilterNode={onSetFilterNode} onActiveNode={this.onActiveNode} onOpen={onOpen} />}
                </div>
            </div>

        )
    }
}