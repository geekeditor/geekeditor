import React, { Component } from "react"
import { Empty } from 'antd'
import "./DocsEmptyRepo.less"
import DocsProviderAdd from './DocsProviderAdd'

export default class DocsEmptyRepo extends Component<{
}, {
}>{
    private provider!: DocsProviderAdd|null;
    constructor(props: any) {
        super(props);
        this.state = {
            docVisible: false
        }
    }

    onAddDocRepo = () => {
        if(this.provider) {
            this.provider.show()
        }
    }

    render() {
        return (
            <div className="docs-empty-repo">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>
                    暂无仓库，<span className="docs-repo__add" onClick={this.onAddDocRepo}>立即添加</span>
                </span>} />
                <DocsProviderAdd ref={(provider)=>{this.provider=provider}}/>
            </div>
        )
    }
}