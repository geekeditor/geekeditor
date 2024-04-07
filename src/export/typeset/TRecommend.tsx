
import React, { Component } from "react"
import TypesetItem from "./TItem";
import { TypesetData } from "./type";
import { RecommendTypesets } from "./loader";
import { Spin } from "antd";
export default class TypesetRecommend extends Component<{
    onCopy: (item: TypesetData) => void;
    onSelect: (item: TypesetData) => void;
    selectItemId?: string|number;
}, {
    list: TypesetData[];
    loading: boolean
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            list: [
            ],
            loading: false
        }
    }

    onLoad = async (item: TypesetData) => {

        return RecommendTypesets.loadTypeset(item.id!).then((css)=>{
            if(css) {
                item.css = css;
            }

            return !!css;
        })
    }

    componentDidMount(): void {
        this.setState({
            loading: true
        })
        RecommendTypesets.loadTypesets().then((list) => {
            this.setState({
                list,
                loading: false
            })
        })
    }
    render() {

        const { list, loading } = this.state;
        const { onCopy, onSelect, selectItemId } = this.props;
        const Items = list.map((item) => {
            return <div className="typeset-item-wrap" key={item.id}><TypesetItem item={item} checked={item.id === selectItemId} copyEnabled={true} onCopy={onCopy} onSelect={onSelect} onLoad={this.onLoad} /></div>
        })

        return (
            <Spin spinning={loading}>
                <div className="typeset-list">
                    {Items}
                </div>
            </Spin>
        )
    }
}