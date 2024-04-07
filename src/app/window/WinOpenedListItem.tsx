import React, { Component } from 'react'
import { CloseOutlined, LoadingOutlined, FileTextOutlined, RightOutlined, CheckOutlined } from '@ant-design/icons'
import { EDocsNodeChangeType, EDocsNodeType, IDocsNodeBase } from '../../types/docs.d';
import { nodePath } from '../../docs/docsprovider/utils'
import BarItem from '../../widgets/BarItem';
import { getExtensionIcon } from '../../docs/DocsConfigs';

export default class WinTabSideBarItem extends Component<{
    node: IDocsNodeBase;
    wrapClassName?: string;
    changed?: boolean;
    onRemove: Function;
    onSelect: Function;
    match?: RegExpMatchArray;
}, {
    path: IDocsNodeBase[];
    
}> {

    constructor(props:any) {
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

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
        this.setState({
            path: nodePath(node)
        })
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    render() {
        const { node } = this.props;
        const match = this.props.match;
        const title = !match ? (node.isConfig ? node.title : node.title || 'Untitled') : match.map((words, index) => {
            if (index === 0 || !words.length) return undefined;
            if (index % 2 === 0) {
                return <em key={index} className="search-mark">{words}</em>
            } else {
                return <span key={index}>{words}</span>
            }
        });
        const extension = node.extension || ''
        const { onRemove, onSelect } = this.props;
        const wrapClassName = this.props.wrapClassName || '';
        const changed = this.props.changed;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving;
        const { path } = this.state;
        const Nodes = path.map((node) => {
            return <span key={node.tempID}>{node.title}<span>{extension}</span>{node.nodeType===EDocsNodeType.EDocsNodeTypeDir && <RightOutlined />}</span>
        })

        const icon = getExtensionIcon(node.extension||'');

        return (
            <div className={["win-opened-list-item", wrapClassName].join(" ")} onClick={(e) => { onSelect(); e.stopPropagation() }}>
                <div className="win-opened-list-item-info">
                    <span className="win-opened-list-item-icon">{isLoading ? <LoadingOutlined /> : icon}</span>
                    <span>{title}<span className="win-opened-list-item-extension">{extension}</span></span>
                    <span className={["win-opened-list-item-op", changed ? " win-opened-list-item-op__changed" : "", isLoading ? " win-opened-list-item-op__loading" : ""].join("")}>
                        {changed && <span className="win-opened-list-item-op-changed"></span>}
                        <span className="win-opened-list-item-op-close" onClick={(e) => { onRemove(); e.stopPropagation(); }}><CloseOutlined /></span>
                    </span>
                </div>
                <div className="win-opened-list-item-path">
                    {Nodes}
                </div>
            </div>
        )
    }
}