import React, { Component } from "react"
import BarItem from '../widgets/BarItem'
import { Empty } from 'antd'
import { NodeExpandOutlined, NodeCollapseOutlined, SisternodeOutlined, FileAddOutlined, FolderAddOutlined, ReloadOutlined, LoadingOutlined, FilterOutlined, PushpinOutlined, DownOutlined } from '@ant-design/icons'
import "./DocsBar.less"
import { EDocsNodeChangeType, EDocsNodeType, EDocsProviderType, IDocsNodeBase } from "../types/docs.d"
import DocsNodesBar from './DocsNodesBar'
import { nodeTraversal } from "./docsprovider/utils"
import { WithTranslation, withTranslation } from "react-i18next"

class DocsBar extends Component<{
    root: IDocsNodeBase;
    onOpen: (node: IDocsNodeBase) => void;
    onActiveNode?: (node: IDocsNodeBase) => void;
    onSetFilterNode: (node: IDocsNodeBase) => void;
    toolbar?: React.ReactNode;
}&WithTranslation, {
}>{


    onExpand = () => {
        const { root } = this.props
        if (!root.children.length) {
            root.load()
        } else {
            nodeTraversal(root, (node: IDocsNodeBase) => {
                node.trigger('expand', true);
            })
        }

    }

    onCollapse = () => {
        const { root } = this.props
        nodeTraversal(root, (node: IDocsNodeBase) => {
            node.trigger('expand', false);
        })
    }

    onCreateNode = (nodeType: EDocsNodeType) => {
        const { root } = this.props;
        root.trigger('create', nodeType);
    }

    onReload = () => {
        const { root } = this.props;
        root.load(true).then((success) => {
        })
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading) {
            this.forceUpdate()
        }
    }

    componentWillUnmount() {
        const { root } = this.props;
        root.offChanged(this.onNodeChanged);
    }

    componentDidMount() {
        const { root } = this.props;
        root.onChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps:any) {

        if(prevProps.root !== this.props.root) {

            if(prevProps.root) {
                prevProps.root.offChanged(this.onNodeChanged);
            }
            
            this.props.root.onChanged(this.onNodeChanged);

        }


    }

    render() {
        const { onOpen, toolbar, onSetFilterNode, t} = this.props;
        const onActiveNode = this.props.onActiveNode;
        const { root } = this.props;
        const supportFile = root.supportCreateNode(EDocsNodeType.EDocsNodeTypeDoc);
        const supportFolder = root.supportCreateNode(EDocsNodeType.EDocsNodeTypeDir);
        const supportReload = root.supportReloadNode;
        const isLoading = root.isLoading;
        const loaded = root.isLoaded;
        return (
            <>
                <div className="docs-bar">
                    <div className="docs-bar-header">
                        {/* <div className="app-logo">
                            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M102.925498 991.418182c-27.927273 23.272727-74.472727 69.818182-51.2-37.236364 46.545455-181.527273 512-884.363636 902.981818-954.181818 111.709091 0-204.8 260.654545-204.8 260.654545s107.054545 13.963636 181.527273-60.50909c-46.545455 218.763636-246.690909 218.763636-297.890909 232.727272 60.509091 9.309091 107.054545 37.236364 200.145455 9.309091-23.272727 60.509091-111.709091 139.636364-437.527273 214.109091-144.290909 51.2-265.309091 311.854545-293.236364 335.127273z" fill="#000000" ></path></svg>
                            <span>极客编辑器<sup>开发版</sup></span>
                        </div> */}
                        <div className="docs-bar-ops">
                            <BarItem icon={<NodeCollapseOutlined />} onClick={this.onCollapse} />
                            <BarItem icon={<NodeExpandOutlined />} onClick={this.onExpand} />
                        </div>
                        <div className="docs-bar-ops">
                            {supportFile && <BarItem disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDoc) }} icon={<FileAddOutlined />} />}
                            {supportFolder && <BarItem disabled={isLoading} onClick={() => { this.onCreateNode(EDocsNodeType.EDocsNodeTypeDir) }} icon={<FolderAddOutlined />} />}
                            {supportReload && <BarItem disabled={isLoading} onClick={this.onReload} icon={isLoading ? <LoadingOutlined /> : <ReloadOutlined />} />}
                        </div>
                        
                    </div>
                    {toolbar}                    
                    {!isLoading && !loaded && <div className="docs-bar-unloaded">{t("repo.noLoad")}<span onClick={this.onReload}>{t("common.refresh")}</span></div>}
                    <DocsNodesBar onActiveNode={onActiveNode} onSetFilterNode={onSetFilterNode} wrapClassName="docs-bar-providers" onOpen={onOpen} root={root} key={root.providerID} />
                </div>
            </>
        )
    }
}

export default withTranslation()(DocsBar)