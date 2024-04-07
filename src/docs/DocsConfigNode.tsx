import React, { Component, DragEvent } from "react"
import { EDocsNodeType, IDocsNodeBase, EDocsNodeChangeType, EDocsProviderType, EDocsNodeBaseStatus, IDocsNodeData } from "../types/docs.d"
import { LoadingOutlined, FolderOpenOutlined, FolderOutlined, FolderAddOutlined, FileAddOutlined, ReloadOutlined, FileTextOutlined, ForkOutlined, DownOutlined, ExclamationCircleOutlined, FileMarkdownOutlined, FileOutlined, FileUnknownOutlined, FileGifOutlined, FileImageOutlined } from '@ant-design/icons'
import BarItem from '../widgets/BarItem'
import { Dropdown, Empty, Menu, Popconfirm, Button } from 'antd';
import TransitionModal from '../widgets/TransitionModal'
import './DocsNode.less'
import DocsNodeEdit from '../widgets/TextEdit'
import { bindEvent, unbindEvent } from '../utils/utils'
import { message } from 'antd'
import sharedClipboard from "../utils/sharedClipboard";
import i18n from "../i18n";
import { getExtensionIcon } from "./DocsConfigs";




export default class DocsConfigNode extends Component<{
    node: IDocsNodeBase;
    activeNode: IDocsNodeBase | undefined;
    onActiveNode: (node: IDocsNodeBase) => void;
    onOpen: (node: IDocsNodeBase) => void;
    hideOps?: boolean;
    noHeader?: boolean;
}, {
    expand: boolean;
    addNodeEditing: boolean;
    addNodeDroping: boolean;
    deleteConfirmVisible: boolean;
    titleEditing: boolean;
    confirmLoading: boolean;
    transformLoading: boolean;
    nodeId: string;
    dragging: boolean;
    addNodeExtension: string;
}> {

    private deleteModal!: TransitionModal | null;
    private transformModal!: TransitionModal | null;
    private readonly MIME_TYPE = 'application/geekeditor-doc';
    static dropNodeMap: { [key: string]: IDocsNodeBase } = {}
    constructor(props: any) {
        super(props);
        this.state = {
            expand: !!props.noHeader,
            addNodeEditing: false,
            addNodeDroping: false,
            deleteConfirmVisible: false,
            titleEditing: false,
            confirmLoading: false,
            transformLoading: false,
            nodeId: '',
            dragging: false,
            addNodeExtension: ".md"
        }
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
        if (e.button === 0) {

            this.onExpand();
            this.onOpenDoc();
        }
        // e.stopPropagation();
    }

    onOpenDoc = () => {
        const { node, onOpen } = this.props;
        if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
            if(node.deprecated) {

                this.onShowTransformModal();

            } else {
                onOpen(node);
            }
            
        }
    }

    onCreateNode = async (config: {extension?: string; fixedType?: string; files?: IDocsNodeData[]}) => {
        
        if(!config.fixedType) {
            this.setState({
                addNodeEditing: true,
                expand: true,
                addNodeExtension: config.extension || ".md"
            })
        } else {
            const files = config.files || [];
            const { node } = this.props;

            await files.reduce((promise, file)=> promise.then(async () => {
                await node.createNode({
                    nodeType: EDocsNodeType.EDocsNodeTypeDoc,
                    parentNode: node,
                    data: {
                        ...file,
                        isConfig: true
                    }
                }).then((node) => {
                    if (node) {
                        return node.mount().then((success) => {
                            if (success) {
                            } else {
                                message.error(i18n.t("repo.createFail"));
                            }
                        })
                    } else {
                        message.error(i18n.t("repo.createFail"));
                    }
                })
            }), Promise.resolve())
        }

    }

    onReload = () => {
        const { node } = this.props;
        node.load().then((success) => {
        })
    }

    onAddNoteEditing = (text: string) => {
        if (text.length) {
            const { node, onOpen } = this.props;
            const nodeType = EDocsNodeType.EDocsNodeTypeDoc;
            const extension = this.state.addNodeExtension || ".md";
            const children = node.configs || [];
            const index = children.findIndex((n) => n.title === text && n.nodeType === nodeType && n.extension === extension);
            if (index !== -1) {
                message.warn(i18n.t("repo.duplicateName"))
                return;
            }

            node.createNode({
                nodeType: nodeType,
                parentNode: node,
                data: {
                    title: text,
                    content: "\n",
                    extension,
                    isConfig: true
                }
            }).then((node) => {
                if (node) {
                    node.mount().then((success) => {
                        if (success) {
                            const { onActiveNode } = this.props;
                            onActiveNode(node);
                            if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
                                onOpen(node);
                            }
                        } else {
                            message.error(i18n.t("repo.createFail"));
                        }
                    })
                } else {
                    message.error(i18n.t("repo.createFail"));
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

    // onAddNodeDroping = async (movingId: string) => {
    //     const { node, onOpen } = this.props
    //     const children = node.children
    //     const movingNode = DocsNode.dropNodeMap[movingId];
    //     if (!movingNode || node.id === movingId) {
    //         return
    //     }

    //     //TODO: find drop target
    //     const find = findDropTarget(node.root.children)
    //     if(!find) {
    //         return
    //     }

    //     clearDropTarget(node.root.children)
    //     const toInsertBefore = find.id
    //     const toInsertIndex = Math.max(0, find.index-1)
    //     const hasIndex = children.findIndex((n) => n === movingNode)
    //     if (hasIndex === toInsertIndex) {
    //         return;
    //     }

    //     this.setState({
    //         addNodeDroping: true
    //     })

    //     if (movingNode.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
    //         await movingNode.load()
    //     }


    //     // let title = movingNode.title;
    //     // let content = movingNode.content;
    //     // const index = children.findIndex((n) => n.title === title && n.nodeType === nodeType);
    //     // if (index !== -1) {
    //     //     title = `${title}_${Date.now()}`
    //     // }
    //     movingNode.moveTo(node, toInsertBefore).then((success)=>{
    //         if (success) {
    //             // const { onActiveNode } = this.props;
    //             // onActiveNode(node);
    //             // if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
    //             //     onOpen(node);
    //             // }

    //             // if(node.root === movingNode.root) {
    //             //     movingNode.remove()
    //             // }

    //         } else {
    //             message.error(i18n.t("repo.saveFail"));
    //         }

    //         this.setState({
    //             addNodeDroping: false
    //         })
    //     })

    //     /*
    //     node.createNode({
    //         nodeType: nodeType,
    //         parentNode: node,
    //         data: {
    //             title,
    //             content
    //         }
    //     }).then((node) => {
    //         if (node) {
    //             node.mount().then((success) => {
    //                 if (success) {
    //                     const { onActiveNode } = this.props;
    //                     onActiveNode(node);
    //                     if (node.nodeType === EDocsNodeType.EDocsNodeTypeDoc) {
    //                         onOpen(node);
    //                     }

    //                     if(node.root === movingNode.root) {
    //                         movingNode.remove()
    //                     }


    //                 } else {
    //                     message.error(i18n.t("repo.saveFail"));
    //                 }
    //             })
    //         } else {
    //             message.error(i18n.t("repo.saveFail"));
    //         }
    //         this.setState({
    //             addNodeDroping: false
    //         })
    //         return node;
    //     })
    //     */
    // }

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
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoving || 
            type === EDocsNodeChangeType.EDocsNodeChangeTypeConfigs || 
            type === EDocsNodeChangeType.EDocsNodeChangeTypeConfigsLoading) {
            this.forceUpdate()
        }
    }

    onContextMenuClick = (e: any) => {
        if (e.key === 'delete') {
            this.onShowConfirmModal();
        }
        e.domEvent.stopPropagation();
    }

    onConfirmDelete = () => {
        const { node } = this.props;

        this.setState({
            confirmLoading: true,
        })
        return node.remove().then((success) => {
            // this.setState({
            //     confirmLoading: false
            // })
            if (success) {
                this.onHideConfirmModal();
            }
        });
    }

    onShowConfirmModal = () => {

        if (this.deleteModal) {
            this.deleteModal.showTransition();
        }
    }

    onHideConfirmModal = () => {
        if (this.deleteModal) {
            this.deleteModal.hideTransition();
        }
    }

    onConfirmTransform = () => {
        const { node } = this.props;

        this.setState({
            transformLoading: true,
        })

        return sharedClipboard.transform(node, true).then((success)=>{
            if(!success) {
                this.setState({
                    transformLoading: false
                })
            } else {
                this.onHideTransformModal()
            }
        })
    }

    onShowTransformModal = () => {

        if (this.transformModal) {
            this.transformModal.showTransition();
        }
    }

    onHideTransformModal = () => {
        if (this.transformModal) {
            this.transformModal.hideTransition();
        }
    }

    onDragEnter = (event: React.DragEvent) => {
        if (this.props.node.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
            this.onExpand(true);
            event.preventDefault();
        }
    }

    componentDidMount() {
        const { node } = this.props;
        this.setState({
            nodeId: node.id + ''
        })
        node.onChanged(this.onNodeChanged);
        node.on('createConfig', this.onCreateNode);
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
        node.off('createConfig', this.onCreateNode)
    }

    render() {
        const { node, activeNode, onActiveNode, onOpen, noHeader } = this.props;
        const hideOps = this.props.hideOps;
        const { expand, addNodeEditing, addNodeDroping, titleEditing, confirmLoading, transformLoading, nodeId, dragging, addNodeExtension } = this.state;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving || node.isMoving || confirmLoading || transformLoading;
        const title = node.title;
        const extension = (node.extension || '');
        const children = node.configs || [];
        const supportReload = node.supportReloadNode;
        const isFolder = node.nodeType === EDocsNodeType.EDocsNodeTypeDir;
        const isActive = node === activeNode;
        const Nodes = children.map((node) => {
            return <DocsConfigNode hideOps={hideOps} onOpen={onOpen} key={node.tempID} node={node} activeNode={activeNode} onActiveNode={onActiveNode} />
        })
        const isRoot = node.isRoot;
        const providerType = node.providerType
        const deleteTitle = i18n.t( isRoot ? "repo.removeRepositoryConfirm" : isFolder ? "repo.deleteFolderConfirm" : "repo.deleteFile")
        const deleteFolderTip = i18n.t(isRoot ? "repo.removeRepositoryTip" : isFolder ?  "repo.deleteFolderTip" : "repo.deleteFileTip")
        const cutStatus = node.status === EDocsNodeBaseStatus.EDocsNodeBaseStatusCut;
        const isDeprecated = node.deprecated;
        const icon = getExtensionIcon(extension);

        const menu = (
            <Menu onClick={this.onContextMenuClick}>
                <Menu.Item key="delete">{i18n.t("common.delete")}</Menu.Item>
            </Menu>
        );

        const loading = isLoading || addNodeDroping
        return (
            <>
                <div data-node-id={nodeId} className={["docs-node", isFolder ? " docs-node--folder" : "", isActive ? " active" : "", cutStatus ? " docs-node--cutting" : "", isDeprecated ? " docs-node--deprecated": ""].join("")} onContextMenu={(e) => { this.onActive(e); e.preventDefault(); e.stopPropagation(); }} onDragEnter={this.onDragEnter}>
                    {!noHeader &&<Dropdown transitionName="" overlay={menu} trigger={['contextMenu']} >
                        <div>
                            {!titleEditing &&
                                <div className="docs-node__nav" onClick={this.onActive}>
                                    <div className="docs-node__info">
                                        {loading && <LoadingOutlined />}
                                        {!loading && isFolder && (expand ? (isRoot ? <DownOutlined /> : <FolderOpenOutlined />) : (isRoot ? <ForkOutlined /> : <FolderOutlined />))}
                                        {!loading && !isFolder && icon}
                                        <span className="docs-node__name">{title}<span className="docs-node__extension">{extension}</span></span>
                                    </div>
                                    {!hideOps && !loading && <div className="docs-node__ops">
                                        {supportReload && <BarItem wrapClassName="app-guide-refresh" disabled={isLoading} onClick={this.onReload} icon={<ReloadOutlined />} />}
                                    </div>}
                                </div>}
                        </div>
                    </Dropdown>
                    }
                    {titleEditing && <div className="docs-node__title-editing"><DocsNodeEdit text={title} onFinishing={this.onTitleEditing} /><div className="docs-node__title-editing-extension">{extension}</div></div>}
                    {isFolder &&
                        <div className={["docs-node__content", (addNodeEditing || Nodes.length) && !noHeader ? ' padding' : ''].join('')} style={{ display: expand && !dragging ? `block` : `none` }}>
                            {addNodeEditing && <div className="docs-node__adding"><DocsNodeEdit text="" onFinishing={this.onAddNoteEditing} /><div className="docs-node__title-editing-extension">{addNodeExtension}</div></div>}
                            {/* {isRoot && !onlyFolder && !titleEditing && !addNodeEditing && !isLoading && !Nodes.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                            <span>
                                暂无文档，<span className="docs-node__new" onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }}>新建</span>
                            </span>
                        } />} */}
                            {Nodes}
                        </div>}
                </div>
                <TransitionModal
                    ref={(modal) => { this.deleteModal = modal }}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button onClick={this.onHideConfirmModal}>{i18n.t("common.cancel")}</Button><Button type="primary" danger onClick={this.onConfirmDelete} loading={confirmLoading}>{i18n.t(isRoot ? 'common.remove' : 'common.delete')}</Button></div></div>}
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
                            <span>{deleteTitle} {title}{extension}? </span>
                        </div>
                        <div className="alert-modal__info">
                            <span>{deleteFolderTip}</span>
                        </div>
                    </div>
                </TransitionModal>
            </>

        )
    }
}