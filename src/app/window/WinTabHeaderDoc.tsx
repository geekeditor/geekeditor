import React, { Component } from 'react'
import { CloseOutlined, DownOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons'
import { EDocsNodeChangeType, IDocsNodeBase } from '../../types/docs.d';
import TextEdit from '../../widgets/TextEdit';

export default class WinTabBarItem extends Component<{
    node: IDocsNodeBase;
    wrapClassName?: string;
    onChangeTitle: Function;
    onRemoveCurrent: () => void,
}, {
    titleEditing: boolean
}> {

    constructor(props: any) {
        super(props);

        this.state = {
            titleEditing: false
        }
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeSaving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoving ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeChanging) {
            this.forceUpdate()
        }

        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeTitleSaved) {
            this.props.onChangeTitle();
        }
    }

    onSave() {
        const {node} = this.props;
        if(node && node.isChanged) {
            node.save()
        }
    }

    onEditTitleBegin = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        const { node } = this.props;
        if(node.isConfig) {
            return;
        }
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

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNodeBase; wrapClassName?: string | undefined; onChangeTitle: Function; }>, prevState: Readonly<{ titleEditing: boolean; }>, snapshot?: any): void {
        if(prevProps.node != this.props.node) {
            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged);
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

    render() {
        const { node, onRemoveCurrent } = this.props;
        const title = node.isConfig ? node.title : node.title || 'Untitled';
        const extension = node.extension||'';
        const { titleEditing } = this.state;
        const wrapClassName = this.props.wrapClassName || '';
        const changed = node.isChanged;
        const isLoading = node.isSaving || node.isLoading || node.isRemoving;
        return (
            <div className={["win-tab-header win-tab-header--doc", wrapClassName].join(" ")}>
                <span className={["win-tab-header-op left", titleEditing ? " win-tab-header-op__editing" : ""].join("")} onMouseDown={(e) => { e.stopPropagation(); }}>
                    {isLoading && <span className="win-tab-header-op-saving"><LoadingOutlined /></span>}
                    {!isLoading && <span className="win-tab-header-op-close"><CloseOutlined onClick={onRemoveCurrent} /></span>}
                </span>
                {!titleEditing &&
                    <span title={title} onClick={this.onEditTitleBegin}>
                        {title}<span className="win-tab-header-extension">{extension}</span>
                    </span>}
                {titleEditing && <TextEdit text={title} onFinishing={this.onEditTitleFinish} />}
                <span className={["win-tab-header-op right", changed ? " win-tab-header-op__changed" : "", isLoading ? " win-tab-header-op__loading" : ""].join("")}>
                    {!isLoading && changed && <span className="win-tab-header-op-changed" onClick={this.onSave}></span>}
                    {/* {isLoading && <span className="win-tab-header-op-saving"><LoadingOutlined /></span>} */}
                    {/* {!isLoading && <span className="win-tab-header-op-edit"><EditOutlined /></span>} */}
                    {/* {!isLoading && <span className="win-tab-header-op-close"><CloseOutlined /></span>} */}
                    {/* {isLoading && <span className="win-tab-header-op-saving"><LoadingOutlined /></span>} */}
                </span>
            </div>
        )
    }
}