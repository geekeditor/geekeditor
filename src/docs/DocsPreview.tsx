import React, { Component } from "react"
import { IDocsNodeBase } from "../types/docs"
export default class DocsPreivew extends Component<{
    activeNode: IDocsNodeBase | undefined;
}>{

    componentDidMount() {
        const { activeNode } = this.props;
        console.log(activeNode)
    }

    componentWillUnmount() {
    }


    render() {
        const { activeNode } = this.props;
        return (
            <div className="docs-preview">
                {activeNode?.title}
            </div>
        )
    }
}