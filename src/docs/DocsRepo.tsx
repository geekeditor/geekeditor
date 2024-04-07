import React, { Component } from "react"
import { EDocsNodeType, IDocsNodeBase, EDocsNodeChangeType } from "../types/docs.d"
import { LoadingOutlined, EditOutlined, SettingOutlined, FolderAddOutlined, FileAddOutlined, ReloadOutlined, RightOutlined, ForkOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import BarItem from '../widgets/BarItem'
import { Dropdown, Empty, Menu, Popconfirm, Button } from 'antd';
import TransitionModal from '../widgets/TransitionModal'
import './DocsRepo.less'
import DocsNodeEdit from '../widgets/TextEdit'
import { bindEvent, unbindEvent } from '../utils/utils'
import { message } from 'antd'
import DocsNode from "./DocsNode";

export default class DocsRepo extends Component<{
    node: IDocsNodeBase;
    activeNode: IDocsNodeBase | undefined;
    onActiveNode: (node: IDocsNodeBase) => void;
    onOpen: (node: IDocsNodeBase) => void;
    hideOps?: boolean;
    onlyFolder?: boolean;
}, {
    expand: boolean;
    addNodeEditing: boolean;
    deleteConfirmVisible: boolean;
    titleEditing: boolean;
    confirmLoading: boolean;
}> {

    private addNodeType!: EDocsNodeType
    private transitionModal!: TransitionModal | null;
    constructor(props: any) {
        super(props);
        this.state = {
            expand: false,
            addNodeEditing: false,
            deleteConfirmVisible: false,
            titleEditing: false,
            confirmLoading: false
        }
        this.addNodeType = EDocsNodeType.EDocsNodeTypeDoc;
    }

    onExpand = (expand?: boolean) => {

        const { node } = this.props;

        expand = expand === undefined ? !this.state.expand : expand;

        if (expand && node.nodeType === EDocsNodeType.EDocsNodeTypeDir && !node.isLoaded) {
            this.onReload()
        }

        this.setState({
            expand: expand
        })

    }

    onActive = (e: React.MouseEvent) => {
        const { onActiveNode, node } = this.props;
        onActiveNode(node);

        this.onExpand();
        this.onOpenDoc();
        // e.stopPropagation();
    }

    onOpenDoc = () => {
        const { node, onOpen } = this.props;
        if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
            onOpen(node);
        }
    }

    onCreateNode = (nodeType: EDocsNodeType) => {
        this.setState({
            addNodeEditing: true,
            expand: true
        })
        this.addNodeType = nodeType

    }

    onReload = () => {
        const { node } = this.props;
        node.load().then((success) => {
        })
    }

    onAddNoteEditing = (text: string) => {
        if (text.length) {
            const { node, onOpen } = this.props;
            const nodeType = this.addNodeType || EDocsNodeType.EDocsNodeTypeDoc;
            const children = node.children;
            const index = children.findIndex((n) => n.title === text && n.nodeType === nodeType);
            if (index !== -1) {
                message.warn(`不能创建重名${nodeType === EDocsNodeType.EDocsNodeTypeDoc ? '文档' : '文件夹'}`)
                return;
            }

            node.createNode({
                nodeType: nodeType,
                parentNode: node,
                data: {
                    title: text,
                    content: ''
                }
            }).then((node) => {
                if (node) {
                    node.mount(true).then((success) => {
                        console.log(success);
                        if (success) {
                            const { onActiveNode } = this.props;
                            onActiveNode(node);
                            if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
                                onOpen(node);
                            }
                        } else {
                            message.error('创建保存失败');
                        }
                    })
                } else {
                    message.error('创建保存失败');
                }
                this.setState({
                    addNodeEditing: false
                })
                return node;
            })
        } else {
            this.setState({
                addNodeEditing: false
            })
        }
    }

    onTitleEditing = (text: string) => {
        if (text.length) {
            const { node } = this.props;
            node.setTitle(text);
            this.setState({
                titleEditing: false
            })
        } else {
            this.setState({
                titleEditing: false
            })
        }
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoving) {
            this.forceUpdate()
        }
    }

    onContextMenuClick = (e: any) => {
        if (e.key === 'rename') {
            this.setState({
                titleEditing: true
            })

        } else if (e.key === 'delete') {
            this.onShowConfirmModal();
        }
        e.domEvent.stopPropagation();
    }

    onConfirmDelete = () => {
        const { node } = this.props;
        node.remove();
        this.setState({
            confirmLoading: true,
        })
        return node.remove().then((success) => {
            this.setState({
                confirmLoading: false
            })
            if (success) {
                this.onHideConfirmModal();
            }
        });
    }

    onShowConfirmModal = () => {
        if (this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }

    onHideConfirmModal = () => {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
        node.on('expand', this.onExpand);
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
        node.off('expand', this.onExpand);
    }

    render() {
        const { node, activeNode, onActiveNode, onOpen } = this.props;
        const hideOps = this.props.hideOps;
        const onlyFolder = this.props.onlyFolder;
        const { expand, addNodeEditing, titleEditing, confirmLoading } = this.state;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving;
        const title = node.title;
        const children = onlyFolder ? node.children.filter((node) => node.nodeType === EDocsNodeType.EDocsNodeTypeDir) : node.children;
        const supportFile = !onlyFolder && node.supportCreateNode(EDocsNodeType.EDocsNodeTypeDoc);
        const supportFolder = node.supportCreateNode(EDocsNodeType.EDocsNodeTypeDir);
        const supportReload = node.supportReloadNode;
        const isFolder = node.nodeType === EDocsNodeType.EDocsNodeTypeDir;
        const isActive = node === activeNode;
        const Nodes = children.map((node) => {
            return <DocsNode hideOps={hideOps} onOpen={onOpen} key={node.tempID} node={node} activeNode={activeNode} onActiveNode={onActiveNode} />
        })
        const isRoot = node.isRoot;

        const menu = (
            <Menu onClick={this.onContextMenuClick}>
                <Menu.Item key="rename">重命名</Menu.Item>
                <Menu.Item key="delete">删除</Menu.Item>
            </Menu>
        );
        return (
            <>
                <div className={["docs-repo", isActive ? " active" : ""].join("")} onContextMenu={(e) => { this.onActive(e); e.preventDefault(); e.stopPropagation(); }}>
                    {/* <Dropdown transitionName="" overlay={menu} trigger={['contextMenu']} disabled={isFolder}>
                        <div>
                            {!titleEditing &&
                                <div className="docs-repo__nav" onClick={this.onActive}>
                                    <div className="docs-repo__info">
                                        {isLoading && <LoadingOutlined />}
                                        {!isLoading && isFolder && (expand ? (isRoot ? <DownOutlined /> : <FolderOpenOutlined />) : (isRoot ? <ForkOutlined /> : <FolderOutlined />))}
                                        {!isLoading && !isFolder && <FileTextOutlined />}
                                        <span className="docs-repo__name">{title}</span>
                                    </div>
                                    {!hideOps && !isLoading && <div className="docs-repo__ops">
                                        {supportFile && <BarItem wrapClassName="app-guide-newfile" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }} icon={<FileAddOutlined />} />}
                                        {supportFolder && <BarItem wrapClassName="app-guide-newfolder" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDir) }} icon={<FolderAddOutlined />} />}
                                        {supportReload && <BarItem wrapClassName="app-guide-refresh" disabled={isLoading} onClick={this.onReload} icon={<ReloadOutlined />} />}
                                        {!isFolder && <BarItem onClick={this.onReload} icon={<EditOutlined />} />}
                                    </div>}
                                </div>}
                        </div>
                    </Dropdown>
                    {titleEditing && <div className="docs-repo__title-editing"><DocsNodeEdit text={title} onFinishing={this.onTitleEditing} /></div>} */}
                    <div className="docs-repo__nav" onClick={this.onActive}>

                        <div className="docs-repo__cover">
                            <div className="docs-repo__img" style={{ backgroundImage: `url("https://cdn.jsdelivr.net/gh/montisan/imagehosting/images/2021-8-4/1628044914252-geekeditor.png")` }}></div>
                        </div>
                        <div className="docs-repo__info">
                            <div className="docs-repo__header">
                                <div className="docs-repo__title">
                                    <span className="docs-repo__text">{title}</span>
                                </div>
                                {!hideOps && !isLoading && <div className="docs-repo__ops">
                                    {supportFile && <BarItem wrapClassName="app-guide-newfile" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }} icon={<FileAddOutlined />} />}
                                    {supportReload && <BarItem wrapClassName="app-guide-refresh" disabled={isLoading} onClick={this.onReload} icon={<ReloadOutlined />} />}
                                    {/* {supportFolder && <BarItem wrapClassName="app-guide-newfolder" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDir) }} icon={<EditOutlined />} />} */}
                                </div>}
                            </div>
                            <div className="docs-repo__desc">编辑器操作帮助文档编辑器操作帮助文档编辑器操作帮助文档编辑器操作帮助文档编辑器操作帮助文档编辑器操作帮助文档编辑器操作帮助文档</div>
                            <div className="docs-repo__detail"></div>
                        </div>
                        <div className="docs-repo__arrow">
                            {isLoading && <LoadingOutlined />}
                            {!isLoading && (expand ?  <DownOutlined /> : <RightOutlined />)}
                        </div>
                    </div>
                    <div className={["docs-repo__content", addNodeEditing || Nodes.length ? ' padding' : ''].join('')} style={{ display: expand ? `block` : `none` }}>
                        {addNodeEditing && <div className="docs-repo__adding"><DocsNodeEdit text="" onFinishing={this.onAddNoteEditing} /></div>}
                        {/* {!titleEditing && !addNodeEditing && !isLoading && !Nodes.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                            <span>
                                暂无文档，<span className="docs-repo__new" onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }}>新建</span>
                            </span>
                        } />} */}
                        {Nodes}
                    </div>
                </div>
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button onClick={this.onHideConfirmModal}>取消</Button><Button type="primary" danger onClick={this.onConfirmDelete} loading={confirmLoading}>删除</Button></div></div>}
                    closable={false}
                    width={300}
                    top="-300px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="alert-modal"
                >
                    <div className="alert-modal__content">
                        <div className="alert-modal__title">
                            <ExclamationCircleOutlined className="alert-modal__icon" />
                            <span>{isFolder ? "确定删除文件夹" : "确定删除文档"} {title}? </span>
                        </div>
                        <div className="alert-modal__info">
                            <span>文档将从仓库删除，删除后将不能找回</span>
                        </div>
                    </div>
                </TransitionModal>
            </>

        )
    }
}