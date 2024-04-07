import React, { Component, DragEvent } from "react"
import { EDocsNodeType, IDocsNodeBase, EDocsNodeChangeType, EDocsProviderType, EDocsNodeBaseStatus } from "../types/docs.d"
import { LoadingOutlined, FolderOpenOutlined, FolderOutlined, FolderAddOutlined, FileAddOutlined, ReloadOutlined, FileTextOutlined, ForkOutlined, DownOutlined, ExclamationCircleOutlined, FileMarkdownOutlined, RightOutlined } from '@ant-design/icons'
import BarItem from '../widgets/BarItem'
import { Dropdown, Empty, Menu, Popconfirm, Button } from 'antd';
import TransitionModal from '../widgets/TransitionModal'
import './DocsNode.less'
import DocsNodeEdit from '../widgets/TextEdit'
import { bindEvent, copyContent, unbindEvent } from '../utils/utils'
import { message } from 'antd'
import sharedClipboard from "../utils/sharedClipboard";
import i18n from "../i18n";
import { getProviderTypeIcon } from "./DocsProviderIcons";

export default class DocsNode extends Component<{
    node: IDocsNodeBase;
    activeNode: IDocsNodeBase | undefined;
    onActiveNode: (node: IDocsNodeBase) => void;
    onSetFilterNode?: (node: IDocsNodeBase) => void;
    onOpen: (node: IDocsNodeBase) => void;
    hideOps?: boolean;
    onlyFolder?: boolean;
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
    addNodeType: EDocsNodeType;
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
            addNodeType: EDocsNodeType.EDocsNodeTypeDoc
        }
    }

    onExpand = (expand?: boolean) => {

        const { node } = this.props;

        const isExpand = expand === undefined ? !this.state.expand : expand;

        if (isExpand && !node.isLoaded) {
            node.load()
        }

        this.setState({
            expand: isExpand
        })

    }

    onActive = (e: React.MouseEvent) => {
        const { onActiveNode, node } = this.props;
        onActiveNode(node);
        if (e.button === 0) {

            if(node.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
                this.onExpand();
            } else {
                this.onOpenDoc();
            }
        }
        e.stopPropagation();
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

    onCreateNode = (nodeType: EDocsNodeType) => {
        this.setState({
            addNodeEditing: true,
            expand: true,
            addNodeType: nodeType
        })

    }

    onReload = () => {
        const { node } = this.props;
        if(node.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
            node.load().then((success) => {
            })
        } else if(node.loadContent) {
            node.loadContent().then((success) => {
            })
        }
        
    }

    onAddNoteEditing = (text: string) => {
        if (text.length) {
            const { node, onOpen } = this.props;
            const nodeType = this.state.addNodeType || EDocsNodeType.EDocsNodeTypeDoc;
            const children = node.children;
            const index = children.findIndex((n) => n.title === text && n.nodeType === nodeType);
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
                    extension: nodeType === EDocsNodeType.EDocsNodeTypeDoc ?  ".md" : ""
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
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeMoving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeStatusChanged ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeDropTargetChanged) {
            this.forceUpdate()
        }
    }

    onContextMenuClick = (e: any) => {
        const {onSetFilterNode, node} = this.props;
        if (e.key === 'rename') {

            //TODO: refractor

            this.setState({
                titleEditing: true
            })
            

        } else if (e.key === 'delete') {
            this.onShowConfirmModal();
        } else if (e.key === 'refresh') {
            const { node } = this.props;
            node.load(true).then((success) => {
            })
        } else if(e.key === 'filter') {
            
            if(onSetFilterNode) {
                onSetFilterNode(node)
            }
            
        } else if(e.key === 'copy') {
            sharedClipboard.toCopy(node);
        } else if(e.key === 'cut') {
            sharedClipboard.toCut(node);
        } else if(e.key === 'paste') {
            const target = node.nodeType === EDocsNodeType.EDocsNodeTypeDir ? node : node.parentNode;
            if(target) {
                sharedClipboard.pasteTo(target);
            }
            
        } else if(e.key === 'transform') {
            this.setState({
                transformLoading: true,
            })
    
            return sharedClipboard.transform(node).then((success)=>{
                if(!success) {
                    this.setState({
                        transformLoading: false
                    })
                }
            })

        } else if(e.key === 'copyLink') {
            const {node} = this.props
            
            copyContent(`[${node.title}](docs/${node.id}${node.extension||''}?r=${node.providerID})`, ["text/plain"]).then(()=>{
                message.success(i18n.t('common.copied'))
            })
        }
        e.domEvent.stopPropagation();
    }

    onConfirmDelete = () => {
        const { node } = this.props;

        this.setState({
            confirmLoading: true,
        })
        return node.remove(true).then((success) => {
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

    onDragStart = (event: DragEvent<HTMLDivElement>) => {
        console.log(event);
        const node = this.props.node;

        const movingId = `${Date.now()}_${node.id}`
        DocsNode.dropNodeMap[movingId] = node;

        event.dataTransfer.setData(this.MIME_TYPE, movingId)
        this.setState({
            dragging: true
        })
    }

    onDragEnd = (event: DragEvent<HTMLDivElement>) => {
        // const result = event.dataTransfer.getData(this.MIME_TYPE)
        this.setState({
            dragging: false
        })
    }

    // onDrop = (event: React.DragEvent) => {
    //     if (this.props.node.nodeType === EDocsNodeType.EDocsNodeTypeDir) {
    //         event.preventDefault();
    //         // event.stopPropagation();
    //         const target = (event.target as Element).closest(`.docs-node--folder`) as HTMLElement
    //         if (target.dataset.nodeId === this.state.nodeId) {
    //             const dataTransfer = event.dataTransfer;
    //             if (dataTransfer) {

    //                 const movingId = dataTransfer.getData(this.MIME_TYPE);
    //                 if (movingId) {

    //                     this.onAddNodeDroping(movingId)

    //                 }

    //             }
    //         }
    //     }
    // }

    onDragEnter = (event: React.DragEvent) => {
        this.onExpand(true);
        event.preventDefault();

    }

    onDragOver = (event: DragEvent) => {
        const targetNode = event.target as Element
        const el = targetNode.nodeType === 3 ? targetNode.parentElement?.closest(`.docs-node__nav`) : targetNode.closest(`.docs-node__nav`)
        if(el) {
            const rect = el.getBoundingClientRect()
            const type = event.pageY < rect.top + rect.height/3 ? 1 : (event.pageY < rect.top + rect.height*2/3) ? 2 : 3
            this.props.node.dropType = type
        }
        
    }

    onDragLeave = () => {
        this.props.node.dropType = 0
    }

    componentDidMount() {
        const { node } = this.props;
        this.setState({
            nodeId: node.id + ''
        })
        node.onChanged(this.onNodeChanged);
        node.on('expand', this.onExpand);
        node.on('create', this.onCreateNode);
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
        node.off('expand', this.onExpand);
        node.off('create', this.onCreateNode)
    }

    render() {
        const { node, activeNode, onActiveNode, onOpen, noHeader, onSetFilterNode } = this.props;
        const hideOps = this.props.hideOps;
        const onlyFolder = this.props.onlyFolder;
        const { expand, addNodeEditing, addNodeType, addNodeDroping, titleEditing, confirmLoading, transformLoading, nodeId, dragging } = this.state;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving || node.isMoving || confirmLoading || transformLoading;
        const title = node.title;
        const extension = (node.extension || '');
        const addExtension = addNodeType === EDocsNodeType.EDocsNodeTypeDoc ? '.md' : ''
        const children = onlyFolder ? node.children.filter((node) => node.nodeType === EDocsNodeType.EDocsNodeTypeDir) : node.children;
        const supportFile = !onlyFolder && node.supportCreateNode(EDocsNodeType.EDocsNodeTypeDoc);
        const supportFolder = node.supportCreateNode(EDocsNodeType.EDocsNodeTypeDir);
        const supportReload = node.supportReloadNode;
        const isFolder = node.nodeType === EDocsNodeType.EDocsNodeTypeDir;
        const isActive = node === activeNode;
        const canMove = node.canMove;
        const Nodes = children.map((node) => {
            return <DocsNode onlyFolder={onlyFolder} hideOps={hideOps} onSetFilterNode={onSetFilterNode} onOpen={onOpen} key={node.tempID} node={node} activeNode={activeNode} onActiveNode={onActiveNode} />
        })
        const isRoot = node.isRoot;
        const providerType = node.providerType
        const deleteTitle = i18n.t( isRoot ? "repo.removeRepositoryConfirm" : isFolder ? "repo.deleteFolderConfirm" : "repo.deleteFile")
        const deleteFolderTip = i18n.t(isRoot ? "repo.removeRepositoryTip" : isFolder ?  "repo.deleteFolderTip" : "repo.deleteFileTip")
        const cutStatus = node.status === EDocsNodeBaseStatus.EDocsNodeBaseStatusCut;
        const target = isFolder ? node : node.parentNode;
        const canPaste = sharedClipboard.canPasteTo(target);
        const isDeprecated = node.deprecated;
        const hasChildren = !!node.hasChildren;

        const menu = (
            <Menu onClick={this.onContextMenuClick}>
                
                {canPaste && <Menu.Item key="paste">{i18n.t("common.paste")}</Menu.Item>}
                {!isFolder && <Menu.Item key="copyLink">{i18n.t("common.copyLink")}</Menu.Item>}
                {!isFolder && <Menu.Item key="copy">{i18n.t("common.copy")}</Menu.Item>}
                {!isFolder && <Menu.Item key="cut">{i18n.t("common.cut")}</Menu.Item>}
                {isFolder && !!onSetFilterNode && <Menu.Item key="filter">{i18n.t("common.top")}</Menu.Item>}
                {/* {isDeprecated && <Menu.Item key="transform">转换新格式</Menu.Item>} */}
                {!isRoot && !isDeprecated && <Menu.Item key="rename">{i18n.t("common.rename")}</Menu.Item>}
                
                <Menu.Item key="delete">{i18n.t("common.delete")}</Menu.Item>
            </Menu>
        );

        const loading = isLoading || addNodeDroping
        const dropType = node.dropType
        const dropTypeClass = dropType === 1 ? " docs-node--drop-top" : dropType === 2 ? " docs-node--drop-in" : dropType === 3 ? " docs-node--drop-bottom" : ""
        const providerIcon  =  isRoot && getProviderTypeIcon(node.providerType) ;
        return (
            <>
                <div data-node-id={nodeId} className={["docs-node", isFolder ? " docs-node--folder" : "", isActive ? " active" : "", cutStatus ? " docs-node--cutting" : "", isDeprecated ? " docs-node--deprecated": "", dropType ? " docs-node--drop-target" : "", dropTypeClass].join("")} onContextMenu={(e) => { this.onActive(e); e.preventDefault(); e.stopPropagation(); }} onDragEnter={this.onDragEnter}>
                    {!noHeader &&<Dropdown transitionName="" overlay={menu} trigger={['contextMenu']} >
                        <div>
                            {!titleEditing &&
                                <div className="docs-node__nav" onClick={this.onActive} draggable={canMove} onDragStart={this.onDragStart} onDragEnd={this.onDragEnd} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave}>
                                    {!isFolder && hasChildren && <span onClick={(e)=>{e.stopPropagation();this.onExpand()}} className="docs-node__expand">{expand ? <DownOutlined /> : <RightOutlined />}</span>}
                                    <div className="docs-node__info">
                                        {loading && <LoadingOutlined />}
                                        {!loading && isFolder && (expand ? (isRoot ? <DownOutlined /> : <FolderOpenOutlined />) : (isRoot ? providerIcon : <FolderOutlined />))}
                                        {!loading && !isFolder && <FileMarkdownOutlined />}
                                        <span className="docs-node__name">{title}<span className="docs-node__extension">{extension}</span></span>
                                    </div>
                                    {!hideOps && !loading && <div className="docs-node__ops">
                                        {supportFile && <BarItem wrapClassName="app-guide-newfile" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }} icon={<FileAddOutlined />} />}
                                        {supportFolder && <BarItem wrapClassName="app-guide-newfolder" disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDir) }} icon={<FolderAddOutlined />} />}
                                        {supportReload && <BarItem wrapClassName="app-guide-refresh" disabled={isLoading} onClick={this.onReload} icon={<ReloadOutlined />} />}
                                        {/* {!isFolder && <BarItem onClick={this.onReload} icon={<EditOutlined />} />} */}
                                    </div>}
                                </div>}
                        </div>
                    </Dropdown>
                    }
                    {titleEditing && <div className="docs-node__title-editing"><DocsNodeEdit text={title} onFinishing={this.onTitleEditing} /><div className="docs-node__title-editing-extension">{extension}</div></div>}
                    <div className={["docs-node__content", (addNodeEditing || Nodes.length) && !noHeader ? ' padding' : ''].join('')} style={{ display: expand && !dragging ? `block` : `none` }}>
                            {addNodeEditing && <div className="docs-node__adding"><DocsNodeEdit text="" onFinishing={this.onAddNoteEditing} /><div className="docs-node__title-editing-extension">{addExtension}</div></div>}
                            {/* {isRoot && !onlyFolder && !titleEditing && !addNodeEditing && !isLoading && !Nodes.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                            <span>
                                暂无文档，<span className="docs-node__new" onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }}>新建</span>
                            </span>
                        } />} */}
                            {Nodes}
                    </div>
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
                {/* <TransitionModal
                    ref={(modal) => { this.transformModal = modal }}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button onClick={this.onHideTransformModal}>取消</Button><Button type="primary" danger onClick={this.onConfirmTransform} loading={transformLoading}>转换并打开</Button></div></div>}
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
                            <span>是否转换新格式并打开文档? </span>
                        </div>
                        <div className="alert-modal__info">
                            <span>该文档为旧版格式，不支持编辑。转换新格式后，可支持无图床插入图片。</span>
                        </div>
                    </div>
                </TransitionModal> */}
            </>

        )
    }
}