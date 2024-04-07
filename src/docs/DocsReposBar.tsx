import React, { Component } from "react"
import "./DocsReposBar.less"
import { EDocsNodeChangeType, IDocsNodeBase } from "../types/docs.d"
import DocsRepo from "./DocsRepo"

export default class DocsBar extends Component<{
    onOpen: (node:IDocsNodeBase)=>void;
    root: IDocsNodeBase;
    defaultActiveNode?: IDocsNodeBase|undefined;
    wrapClassName?: string;
    onActiveNode?: (node: IDocsNodeBase) => void;
    hideOps?:boolean;
    onlyFolder?:boolean;
}, {
    activeNode: IDocsNodeBase|undefined;
}>{
    constructor(props: any) {
        super(props)
        this.state = {
            activeNode: props.defaultActiveNode || undefined
        }
    }

    onActiveNode = (node: IDocsNodeBase) => {
        this.setState({
            activeNode: node
        })

        if(this.props.onActiveNode) {
            this.props.onActiveNode(node);
        }
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if(type === EDocsNodeChangeType.EDocsNodeChangeTypeTitle) {
            this.forceUpdate()
        } else if(type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren) {
            this.forceUpdate()
        }
    }

    componentDidMount() {
        const {root} = this.props;
        root.onChanged(this.onNodeChanged);
        if(root.children.length && !this.state.activeNode) {
            this.setState({
                activeNode: root.children[0]
            })
        }
    }

    componentWillUnmount() {
        const { root } = this.props;
        root.offChanged(this.onNodeChanged);
    }

    render() {
        const {onOpen, root} = this.props;
        const hideOps = this.props.hideOps;
        const onlyFolder = this.props.onlyFolder;
        const nodes = root.children;
        const {activeNode} = this.state;
        const wrapClassName = this.props.wrapClassName  || '';
        const Nodes = nodes.map((node)=>{
            return <DocsRepo onlyFolder={!!onlyFolder} hideOps={!!hideOps} key={node.tempID} node={node} activeNode={activeNode} onActiveNode={this.onActiveNode} onOpen={onOpen}/>
        })

        return (
            <div className={["docs-repos-bar", wrapClassName].join(" ")}>
                {Nodes}
            </div>
        )
    }
}