import React, { Component } from "react"
import Docs from '../docs/Docs'
import { EDocsNodeChangeType, IDocsNodeBase } from "../types/docs.d"
import factory from "../docs/docsprovider/DocsProviderFactory";


export default class AppSideBarProviders extends Component<{
    onActiveNode?: (node: IDocsNodeBase) => void;
    onOpen: (node: IDocsNodeBase) => void;
    providerSelect: string;
}, {
    
}> {
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
        const { providerSelect, onOpen } = this.props;
        const onActiveNode = this.props.onActiveNode;
        const root = factory;
        const children = root.children;

        const BarDocs = children.map((provider)=>{
            const providerID = provider.providerID;
            return <div className="app-side-bar-tab__docs" style={{ display: providerSelect !== providerID ? 'none' : 'block' }} key={providerID}>
                        <Docs onActiveNode={onActiveNode} onOpen={onOpen} root={provider}/>
                    </div>
        })
        


        return (
            <>
                {BarDocs}
            </>
        )
    }
}