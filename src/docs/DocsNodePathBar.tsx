import React, { Component } from "react"
import './DocsNodePathBar.less'
import { EDocsNodeChangeType, EDocsNodeType, IDocsNodeBase } from "../types/docs.d"
import { Button, Popover } from 'antd';
import { RightOutlined, EditOutlined, FileTextOutlined, FolderOutlined, ReloadOutlined, LoadingOutlined } from "@ant-design/icons"
import TextEdit from '../widgets/TextEdit'
import DocsNodesBar from "./DocsNodesBar";
import { nodePath } from './docsprovider/utils'
import BarItem from "../widgets/BarItem";
import DocsOutlineBar from "./DocsOutlineBar";


class DocsNodeOutlineItem extends Component<{
    node: IDocsNodeBase;
}, {
    nodesBarVisible: boolean;
    title: string;
}>{

    constructor(props: any) {
        super(props)
        const activeOutline = this.findActiveOutline()
        this.state = {
            nodesBarVisible: false,
            title: activeOutline ? activeOutline.text : ""
        }
    }

    findActiveOutline = () => {
        let outlines = this.props.node.outlines || [];
        let originalActiveOutlineId = this.props.node.activeOutlineId;
        let activeOutline;
        for (let i = 0; i < outlines.length; i++) {
            const outline = outlines[i];
            if (/heading\d/.test(outline.type)) {
                activeOutline = outline
            }

            if (outline.id === originalActiveOutlineId || !originalActiveOutlineId) {
                break;
            }
        }
        return activeOutline;
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {

        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeContent ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeOutline) {
            const activeOutline = this.findActiveOutline()
            this.setState({
                title: activeOutline ? activeOutline.text : ""
            })
        }
    }

    onNodesBarVisible = (visible: boolean) => {
        if (!this.props.node.isConfig) {
            this.setState({
                nodesBarVisible: visible
            })
        }
    }

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNodeBase; }>): void {
        if (prevProps.node !== this.props.node) {
            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged);

            const activeOutline = this.findActiveOutline()
            this.setState({
                title: activeOutline ? activeOutline.text : ""
            })

        }
    }

    render() {
        const { node } = this.props;
        const { nodesBarVisible, title } = this.state;
        const extension = node.extension || '';

        const content =
            (<div className="path-docs-outlines">
                <DocsOutlineBar node={node} />
            </div>);
        return (
            extension === ".md" && title &&
            <div className="docs-node-path-bar-item">
                <Popover placement="bottomLeft" open={nodesBarVisible} onOpenChange={this.onNodesBarVisible} content={content} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
                    <div className="path-item">
                        <>
                            <span className={["path-item__icon"].join('')}>
                                <RightOutlined />
                            </span>
                            <span className="path-item__title outline">
                                {title}
                            </span>
                        </>
                    </div>
                </Popover>
            </div>
        )
    }
}

class DocsNodePathBarItem extends Component<{
    node: IDocsNodeBase;
    onOpen: (node: IDocsNodeBase) => void;
    last: boolean;
}, {
    titleEditing: boolean;
    nodesBarVisible: boolean;
}>{

    constructor(props: any) {
        super(props)
        this.state = {
            titleEditing: false,
            nodesBarVisible: false
        }
    }

    onEditTitleBegin = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        this.setState({
            titleEditing: true
        })
        event.stopPropagation();
    }

    onEditTitleFinish = (text: string) => {
        const { node } = this.props;
        if (text) {
            node.setTitle(text);
        }

        this.setState({
            titleEditing: false
        })
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {

        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle) {
            this.forceUpdate()
        }
    }

    onActiveNode = (node: IDocsNodeBase) => {

        if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
            this.setState({
                nodesBarVisible: false
            })
            const { onOpen } = this.props;
            onOpen(node);
        }
    }

    onNodesBarVisible = (visible: boolean) => {
        if (!this.props.node.isConfig) {
            this.setState({
                nodesBarVisible: visible
            })
        }
    }

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
        const title = node.title || node.extension;
        if (!title) {
            this.setState({
                titleEditing: true
            })
        }
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    render() {
        const { node } = this.props;
        const { titleEditing, nodesBarVisible } = this.state;
        const title = node.isConfig ? node.title : node.title || 'Untitled';
        const extension = node.extension || '';
        const isFile = node.nodeType === EDocsNodeType.EDocsNodeTypeDoc;
        const { onOpen, last } = this.props;
        const parentNode = node.parentNode || node;
        const editable = false //!!node.parentNode && isFile;

        const content =
            (<div className="path-docs-nodes">
                <DocsNodesBar root={parentNode} onActiveNode={this.onActiveNode} onOpen={onOpen} defaultActiveNode={node} />
            </div>);
        return (
            <div className="docs-node-path-bar-item">
                <Popover placement="bottomLeft" open={nodesBarVisible} onOpenChange={this.onNodesBarVisible} content={content} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
                    <div className="path-item">
                        {!titleEditing &&
                            <>
                                {/* <span className="path-item__icon">
                                    {isFile ? <FileTextOutlined /> : <FolderOutlined />}
                                </span> */}
                                <span className="path-item__title" title={title}>
                                    {title}<span className="path-item__extension">{extension}</span>
                                </span>
                                <span className={["path-item__icon", !editable ? ' path-item__icon--disabled' : ''].join('')}>
                                    {!last && <RightOutlined />}
                                </span>
                            </>}
                        {titleEditing && <TextEdit text={title} onFinishing={this.onEditTitleFinish} />}
                    </div>
                </Popover>
            </div>
        )
    }
}

export default class DocsNodePathBar extends Component<{
    node: IDocsNodeBase;
    onOpen: (node: IDocsNodeBase) => void;
}, {
    path: IDocsNodeBase[]
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            path: []
        }
    }

    componentDidMount() {
        const { node } = this.props;
        this.setState({
            path: nodePath(node)
        })
        node.onChanged(this.onNodeChanged);
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading) {
            this.forceUpdate()
        } else if (type === EDocsNodeChangeType.EDocsNodeChangeTypeMounted) {
            const { node } = this.props;
            this.setState({
                path: nodePath(node)
            })
        }
    }
    onReload = () => {
        const { node } = this.props;
        node.loadContent && node.loadContent();
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNodeBase; onOpen: (node: IDocsNodeBase) => void; }>, prevState: Readonly<{ path: IDocsNodeBase[]; isLoading: boolean; }>, snapshot?: any): void {
        if (prevProps.node !== this.props.node) {

            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged)

            const { node } = this.props;
            this.setState({
                path: nodePath(node)
            })
        }
    }

    render() {
        const { onOpen, node } = this.props;
        const { path } = this.state;
        const isLoading = node.isLoading;
        const disabled = node.isLoading || node.isSaving || node.isChanged;

        const Nodes = path.map((node, index) => {
            return <DocsNodePathBarItem onOpen={onOpen} key={node.tempID} node={node} last={index === path.length - 1} />
        })

        return (
            <div className="docs-node-path-bar">
                <div className="docs-nodes">
                    {Nodes}
                    <DocsNodeOutlineItem node={node} />
                    <BarItem wrapClassName="docs-node-path-bar-load-item" disabled={disabled} onClick={this.onReload} icon={isLoading ? <LoadingOutlined /> : <ReloadOutlined />} />
                </div>
            </div>
        )
    }
}