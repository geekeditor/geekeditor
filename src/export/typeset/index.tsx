
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import React, { Component } from "react"
import TypesetRecommend from "./TRecommend";
import { SegmentedValue } from "antd/es/segmented";
import TypesetCustom from "./TCustom";

import './index.less';
import { TypesetData } from "./type";
import { RecommendTypesets } from "./loader";
import i18n from "../../i18n";
export default class Typeset extends Component<{
    onUpdateTypeset: (typesetText: string) => void;
}, {
    showSelect: boolean;
    typesetListType: SegmentedValue;
    selectedTypeset: TypesetData | null;
}> {

    custom!: TypesetCustom | null;
    constructor(props: any) {
        super(props);
        this.state = {
            showSelect: false,
            typesetListType: 'recommend',
            selectedTypeset: RecommendTypesets.builtinDefaultTypeset,
        }
    }
    onShowSelect() {
        this.setState({
            showSelect: true
        })
    }
    onHideSelect() {
        this.setState({
            showSelect: false
        })
    }
    onChangeTypesetListType(typesetListType: SegmentedValue) {
        this.setState({
            typesetListType
        })
    }

    onCopy(typeset: TypesetData) {
        if(this.custom) {
            this.setState({
                typesetListType: "custom"
            }, () => {
                this.custom?.onAddTypeset(typeset)
            })
        }
    }

    onSelect(typeset: TypesetData) {
        this.setState({
            selectedTypeset: typeset
        })
        this.props.onUpdateTypeset(typeset.css!)
    }

    onUpdateCurrentTypeset() {
        this.props.onUpdateTypeset(this.state.selectedTypeset?.css!)
    }

    componentDidMount(): void {
        this.onUpdateCurrentTypeset();
    }

    render() {
        const { showSelect, typesetListType, selectedTypeset } = this.state;
        const { onUpdateTypeset } = this.props;
        // const {
        return (
            <>
                <div className={["typeset-select", showSelect ? "typeset-select--show" : ""].join(' ')}>
                    <div className="typeset-segmented">
                        <Segmented onChange={this.onChangeTypesetListType.bind(this)} value={typesetListType} options={[{ value: 'recommend', label: i18n.t("common.recommend") }, { value: 'custom', label: i18n.t("common.custom")}]} block />
                    </div>
                    <div className="typeset-container">
                        <div className={["typeset-list-wrap", typesetListType === 'recommend' ? "typeset-list-wrap--show" : ""].join(" ")}>
                            <TypesetRecommend onCopy={this.onCopy.bind(this)} onSelect={this.onSelect.bind(this)} selectItemId={selectedTypeset?.id} />
                        </div>
                        <div className={["typeset-list-wrap", typesetListType === 'custom' ? "typeset-list-wrap--show" : ""].join(" ")}>
                            <TypesetCustom ref={(val) => this.custom = val} onCopy={this.onCopy.bind(this)} onSelect={this.onSelect.bind(this)} selectItemId={selectedTypeset?.id} onUpdateTypeset={onUpdateTypeset} onUpdateCurrentTypeset={this.onUpdateCurrentTypeset.bind(this)} />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}