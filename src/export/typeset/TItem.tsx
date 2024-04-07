
import { CheckOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { Component } from "react"
import { TypesetData } from "./type";
import { Popconfirm } from "antd";
import i18n from "../../i18n";
export default class TypesetItem extends Component<{
    item: TypesetData;
    checked?: boolean;
    copyEnabled?: boolean;
    editEnabled?: boolean;
    deleteEnabled?: boolean;
    onLoad?: (item: TypesetData) => Promise<boolean>
    onSelect?: (item: TypesetData) => void;
    onCopy?: (item: TypesetData) => void;
    onEdit?: (item: TypesetData) => void;
    onDelete?: (item: TypesetData) => void;
}, {
    top: number;
    loading: boolean;
}> {
    img!: HTMLImageElement | null;
    constructor(props: any) {
        super(props);
        this.state = {
            top: 0,
            loading: false
        }
    }
    addAnimation() {
        if (this.img) {
            const height = this.img.height;
            this.setState(
                {
                    top: -Math.max(0, height - 100)
                }
            )
        }
    }
    removeAnimation() {
        this.setState({
            top: 0
        })
    }
    async onSelect() {
        const { item, onSelect, onLoad } = this.props;
        let loaded = !!item.css;
        if (!item.css && onLoad) {
            //TODO: Load typeset
            this.setState({
                loading: true
            })
            loaded = await onLoad(item);
            this.setState({
                loading: false
            })
        }

        if (loaded) {
            onSelect && onSelect(item);
        }

    }
    render() {
        const { item, checked, copyEnabled, editEnabled, deleteEnabled, onCopy, onEdit, onDelete } = this.props;
        const { top } = this.state;
        return (
            <div className={["typeset-item", checked ? "typeset-item--checked" : ""].join(" ")} onClick={this.onSelect.bind(this)}>
                <div className="typeset-item-cover" onMouseLeave={this.removeAnimation.bind(this)} onMouseEnter={this.addAnimation.bind(this)}>
                    {item.cover && <img style={{ top: `${top}px` }} ref={(img) => this.img = img} src={item.cover} />}
                    {!item.cover && item.title}
                    <div className="typeset-item-bar">
                        <div className="typeset-item-title"></div>
                        <div className="typeset-item-tools">
                            {editEnabled && <EditOutlined onClick={(e) => { e.stopPropagation(); onEdit && onEdit(item) }} />}
                            {copyEnabled && <CopyOutlined onClick={(e) => { e.stopPropagation(); onCopy && onCopy(item) }} />}
                            {deleteEnabled && <Popconfirm
                                title={i18n.t("settings.deleteThemeConfirm")}
                                onConfirm={() => { onDelete && onDelete(item) }}
                                okText={i18n.t("common.ok")}
                                cancelText={i18n.t("common.cancel")}
                            >
                                <DeleteOutlined />
                            </Popconfirm>}
                        </div>
                    </div>
                </div>
                {checked && <div className="typeset-item-checked">
                    <CheckOutlined />
                </div>}
            </div>
        )
    }
}