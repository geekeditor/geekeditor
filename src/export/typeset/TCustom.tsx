import React, { Component } from "react";
import TypesetItem from "./TItem";
import TypesetEditor from "./TypesetEditor";
import { TypesetData } from "./type";
import { Spin, message } from "antd";
import { CustomLocalTypesets, RecommendTypesets } from "./loader";
import { PlusOutlined } from "@ant-design/icons";
export default class TypesetCustom extends Component<
    {
        onCopy: (item: TypesetData) => void;
        onSelect: (item: TypesetData) => void;
        onUpdateTypeset: (content: string) => void;
        onUpdateCurrentTypeset: () => void;
        selectItemId?: string|number;
    },
    {
        list: TypesetData[];
        loading: boolean;
        typesetEditing: boolean;
        editTypeset: TypesetData;
    }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            list: [],
            loading: false,
            typesetEditing: false,
            editTypeset: {
                title: "",
                css: "",
            },
        };
    }

    componentDidMount(): void {
        this.setState({
            loading: true,
        });
        CustomLocalTypesets.loadTypesets().then((list) => {
            this.setState({
                list,
                loading: false,
            });
        });
    }

    onAddTypeset(typeset?: TypesetData) {
        const editTypeset = {
            title: `${typeset?.title || "Default"}-Copy`,
            css: typeset ? typeset.css : RecommendTypesets.builtinDefaultTypeset.css,
        };
        this.onEditTypeset(editTypeset);
    }

    onEditTypeset(typeset: TypesetData) {
        this.setState({
            typesetEditing: true,
            editTypeset: typeset,
        });
        this.props.onUpdateTypeset(typeset.css!);
    }

    onDeleteTypeset(typeset: TypesetData) {
        
        CustomLocalTypesets.deleteTypeset(typeset);
        this.setState({
            list: this.state.list.filter((item) => item.id !== typeset.id),
        });
    }

    onCompleteTypeset = (typeset: TypesetData) => {
        CustomLocalTypesets.saveTypeset(typeset);
        this.props.onSelect(typeset);
        this.setState({
            typesetEditing: false,
            list: [...this.state.list, typeset],
        });
    };

    onUpdateTypeset = (typeset: TypesetData) => {
        this.props.onUpdateTypeset(typeset.css!);
    };

    onCloseEditor = () => {
        this.setState({
            typesetEditing: false,
        });
        this.props.onUpdateCurrentTypeset();
    };
    render() {
        const { list, loading, typesetEditing, editTypeset } = this.state;
        const { onCopy, onSelect, selectItemId } = this.props;
        const Items = list.map((item) => {
            return (
                <div className="typeset-item-wrap" key={item.id}>
                    <TypesetItem
                        item={item}
                        checked={item.id === selectItemId}
                        copyEnabled={false}
                        editEnabled={true}
                        deleteEnabled={true}
                        onEdit={this.onEditTypeset.bind(this)}
                        onDelete={this.onDeleteTypeset.bind(this)}
                        onCopy={onCopy}
                        onSelect={onSelect}
                    />
                </div>
            );
        });

        return (
            <>
                <Spin spinning={loading}>
                    <div className="typeset-list">
                        {Items}<div className="typeset-item-wrap">
                            <div className="typeset-item-add" onClick={()=>this.onAddTypeset()}>
                                <PlusOutlined />
                            </div>
                        </div>
                    </div>
                </Spin>
                {typesetEditing && (
                    <TypesetEditor
                        data={editTypeset}
                        onClose={this.onCloseEditor.bind(this)}
                        onComplete={this.onCompleteTypeset.bind(this)}
                        onUpdate={this.onUpdateTypeset.bind(this)}
                    />
                )}
            </>
        );
    }
}
