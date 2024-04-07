import React, { Component } from 'react'
import { RightOutlined, LoadingOutlined, FileTextOutlined } from '@ant-design/icons'
import { EDocsNodeChangeType, EDocsNodeType, IDocsNodeBase, IDocsSearchResult } from '../types/docs.d';
import { nodePath } from './docsprovider/utils'
import { Dropdown, Menu, message } from 'antd';
import i18n from '../i18n';
import sharedClipboard from '../utils/sharedClipboard';
import { copyContent } from '../utils/utils';

export default class DocsSearchResultItem extends Component<{
    onOpen: (node: IDocsNodeBase) => void;
    result: IDocsSearchResult
}, {
    path: IDocsNodeBase[]
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            path: []
        }
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoving) {
            this.forceUpdate()
        }
    }

    onContextMenuClick = (e: any) => {
        const { node } = this.props.result;
        if (e.key === 'copy') {
            sharedClipboard.toCopy(node);
        } else if (e.key === 'copyLink') {
            copyContent(`[${node.title}](docs/${node.id}${node.extension || ''})`, ["text/plain"]).then(() => {
                message.success(i18n.t('common.copied'))
            })
        }
        e.domEvent.stopPropagation();
    }

    componentDidMount() {
        const { node } = this.props.result;
        node.onChanged(this.onNodeChanged);
        this.setState({
            path: nodePath(node)
        })
    }

    componentWillUnmount() {
        const { node } = this.props.result;
        node.offChanged(this.onNodeChanged);
    }

    render() {
        const { node, match } = this.props.result;
        const title = !match ? node.title || 'Untitled' : match.map((words, index) => {
            if (index == 0 || !words.length) return undefined;
            if (index % 2 == 0) {
                return <em key={index} className="search-mark">{words}</em>
            } else {
                return <span key={index}>{words}</span>
            }
        });
        const { onOpen } = this.props;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving;
        const { path } = this.state;
        const Nodes = path.map((node, index) => {
            return <span key={node.tempID}>{node.title}{index < path.length - 1 && <RightOutlined />}</span>
        })
        const menu = (
            <Menu onClick={this.onContextMenuClick}>

                <Menu.Item key="copyLink">{i18n.t("common.copyLink")}</Menu.Item>
                <Menu.Item key="copy">{i18n.t("common.copy")}</Menu.Item>
            </Menu>
        );
        return (
            <Dropdown transitionName="" overlay={menu} trigger={['contextMenu']}>
                <div className={["docs-search-result-item"].join(" ")} onClick={(e) => { onOpen(node); e.stopPropagation() }}>
                    <div className="docs-search-result-item-info">
                        <span className="docs-search-result-item-icon">{isLoading ? <LoadingOutlined /> : <FileTextOutlined />}</span>
                        <span>{title}</span>
                    </div>
                    <div className="docs-search-result-item-path">
                        {Nodes}
                    </div>
                </div>
            </Dropdown>
        )
    }
}