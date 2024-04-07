import React, {Component, lazy, Suspense} from 'react'
import { EDocsNodeChangeType, IDocsNodeBase } from '../../types/docs.d';
import {EyeInvisibleOutlined, LoadingOutlined} from '@ant-design/icons'
import './WinTabContentDoc.less'
import { withTranslation, WithTranslation } from 'react-i18next';
const Editor = lazy(() => import('../../editor'));
const Monaco = lazy(() => import('../../monaco'));

class WinTabContentDoc extends Component<{
    wrapClassName?: string;
    node: IDocsNodeBase;
    isActive: boolean;
    onRemoved: ()=>void;
    onOpen: (node:IDocsNodeBase)=>void;
}&WithTranslation> {

    iframe!:HTMLIFrameElement|null;
    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeRemoved) {
            const { onRemoved } = this.props;
            onRemoved()
        }
    }

    componentDidUpdate(prevProps: Readonly<{ wrapClassName?: string | undefined; node: IDocsNodeBase; isActive: boolean; onRemoved: () => void; onOpen: (node: IDocsNodeBase) => void; } & WithTranslation<undefined, undefined>>, prevState: Readonly<{}>, snapshot?: any): void {
        if(this.props.isActive && !prevProps.isActive) {
            const node = this.props.node;
            !node.isContentLoaded && node.loadContent && node.loadContent();
        }
    }

    componentWillUnmount() {
        const node = this.props.node
        node.offChanged(this.onNodeChanged);
    }

    componentDidMount() {
        const node = this.props.node
        node.onChanged(this.onNodeChanged);
        if(this.props.isActive) {
            !node.isContentLoaded && node.loadContent && node.loadContent();
        }
    }

    render() {
        const {node, onOpen, isActive, t} = this.props;
        const keepAlived = false // this.editable?.keepAlived;
        const wrapClassName = this.props.wrapClassName  || '';
        const extension = (node.extension || '').toLowerCase()
        const isMarkdown = extension === '.md'
        const supportEditing = node.supportEditing;
        const isRemoved = node.isRemoved;
        return (
            <div className={["win-tab-content-doc", wrapClassName].join(" ")}>
                {/* <DocsNodePathBar onOpen={onOpen} node={node} /> */}
                {(isActive || keepAlived) && 
                <div className="content-doc-editor">
                    {!supportEditing && <div className='content-not-suport-editing'><EyeInvisibleOutlined style={{marginRight: '5px'}}/>{t("editor.notSupportEditing")}</div>}
                    {isRemoved && <div className='content-not-suport-editing'><EyeInvisibleOutlined style={{marginRight: '5px'}}/>{t("editor.removedTip")}</div>}
                    {isMarkdown && !isRemoved && <Suspense fallback={<div className="content-doc-editor__loading"><div>{t("editor.initLoading")}</div><div><LoadingOutlined /></div></div>}> 
                        <Editor node={node}/>
                    </Suspense>}
                    {!isMarkdown && !isRemoved && supportEditing && <Suspense fallback={<div className="content-doc-editor__loading"><div>{t("editor.initLoading")}</div><div><LoadingOutlined /></div></div>}> 
                        <Monaco node={node}/>
                    </Suspense>}

                </div>}
            </div>
        )
    }
}

export default withTranslation()(WinTabContentDoc)