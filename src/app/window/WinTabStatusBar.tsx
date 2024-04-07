import React, { Component } from "react"
import DocsNodePathBar from "../../docs/DocsNodePathBar";
import { EDocsNodeChangeType, IDocsNode, IDocsNodeBase } from "../../types/docs.d";
import WinTabZen from "./tools/WinTabZen";
import { WithTranslation, withTranslation } from "react-i18next";
import WinTabFocusMode from "./tools/WinTabFocusMode";
// import WinTabZen from "./WinTabZen";


class AppTabStatusBar extends Component<{
    node: IDocsNodeBase;
    onOpen: (node:IDocsNodeBase)=>void;
}&WithTranslation, {
}> {
    constructor(props: any) {
        super(props)
    }

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeContent) {
            this.forceUpdate()
        }
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNodeBase; onOpen: (node: IDocsNodeBase) => void; }>, prevState: Readonly<{ path: IDocsNodeBase[]; isLoading: boolean; }>, snapshot?: any): void {
        if(prevProps.node !== this.props.node) {

            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged);
        }
    }

    render() {
        const {node, onOpen, t} = this.props;
        const wordCount = (node as IDocsNode).wordCount;
        const isConfig = !!node.isConfig
        return (
            <div className="win-tab-status-bar">
                <DocsNodePathBar onOpen={onOpen} node={node} />
                {!isConfig && <div className="win-tab-status-bar-words">{t("repo.words")}:{wordCount}</div>}
                <div className="win-tab-status-bar-tools">
                    <WinTabFocusMode />
                    <WinTabZen />
                </div>
            </div>
        )
    }
}

export default withTranslation()(AppTabStatusBar)