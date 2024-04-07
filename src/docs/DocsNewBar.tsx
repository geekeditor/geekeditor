import React, { Component } from "react"
import ReactDOM from 'react-dom'
import { Modal } from 'antd'
import { FileAddOutlined, NodeCollapseOutlined, SisternodeOutlined } from '@ant-design/icons'
import "./DocsNewBar.less"
import factory from './docsprovider/DocsProviderFactory'
import { EDocsNodeChangeType, IDocsNodeBase } from "../types/docs.d"
import DocsNodesBar from './DocsNodesBar'
import DocsEmptyRepo from './DocsEmptyRepo'
import TransitionModal from '../widgets/TransitionModal'
import i18n from "../i18n"
import DocsSearchBar from "./DocsSearchBar"

export default class DocsNewBar extends Component<{
    onOpen: (node: IDocsNodeBase) => void;
}, {
    }>{

    private transitionModal!: TransitionModal | null;
    constructor(props: any) {
        super(props);
        this.state = {
            visible: false,
        }
    }

    show() {
        if (this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }

    onHide = () => {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }

    onOpen = (node: IDocsNodeBase) => {
        const { onOpen } = this.props;
        onOpen(node);
        this.onHide();
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren) {
            this.forceUpdate()
        }
    }

    componentWillUnmount() {
        factory.offChanged(this.onNodeChanged);
    }

    componentDidMount() {
        factory.onChanged(this.onNodeChanged);
    }

    render() {
        const t = i18n.t;
        const root: any = factory;
        const children = root.children;
        return (
            <>
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={<><span>{t("settings.newDocument")}</span><span className="docs-new-modal-tip" >{t("settings.newDocumentTip1")}<FileAddOutlined /> {t("settings.newDocumentTip2")}</span></>}
                    onOk={this.onHide}
                    onCancel={this.onHide}
                    footer={null}
                    width={400}
                    top="-300px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="docs-new-modal"
                >
                    <div className="docs-new-modal-body">
                        <DocsSearchBar onOpen={this.onOpen} root={root}>
                            <div className="docs-all-bar">
                                {!children.length && <DocsEmptyRepo />}
                                <DocsNodesBar wrapClassName="docs-bar-providers" onOpen={this.onOpen} root={root} />
                            </div>
                        </DocsSearchBar>
                    </div>
                </TransitionModal>
            </>
        )
    }
}