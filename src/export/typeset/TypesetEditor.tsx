import React, { Component } from 'react'
import './TypesetEditor.less'
import { Input, Button } from 'antd'
import CodeMirror from 'react-codemirror'
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
import "codemirror/theme/panda-syntax.css";
import "codemirror/addon/hint/show-hint.css";
import { TypesetData } from './type';
import { LeftOutlined } from '@ant-design/icons';
import BarItem from '../../widgets/BarItem';

require("codemirror/lib/codemirror");
require("codemirror/mode/css/css");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/css-hint");

export default class TypesetItem extends Component<{
    data: TypesetData;
    onUpdate: (item: any) => void;
    onComplete: (item: any) => void;
    onClose: () => void;
}, {
    title: string;
    content: string;
}> {

    private mirror!: any;
    constructor(props: any) {
        super(props);

        this.state = {
            title: '',
            content: ''
        }
    }

    // static getDerivedStateFromProps(nextProps:any, prevState:any) {
    //     return {...nextProps.data};
    // }

    onCodeChange = (content: string) => {
        const { data, onUpdate } = this.props;
        data.css = content;
        onUpdate(data);
    }

    onCodeComplete = () => {
        const { data, onComplete } = this.props;
        data.title = this.state.title;
        onComplete(data);
    }

    onChangeTitle = (e: React.ChangeEvent) => {
        const { data } = this.props;
        this.setState({
            title: (e.target as HTMLInputElement).value
        })
    }

    onKeyDown = (e: React.KeyboardEvent) => {
        if (this.mirror) {
            const code = this.mirror.getCodeMirror();
            if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
                code.closeHint();
            } else if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
                code.showHint();
            }
        }
        e.stopPropagation();
    }

    componentDidMount() {
        const { data } = this.props;
        this.setState({
            title: data.title,
            content: data.css || ''
        })
    }

    render() {
        const { data, onClose } = this.props;
        const { title, content } = this.state;
        const options = {
            tabSize: 2,
            lineNumbers: true,
            line: false,
            indentWithTabs: true,
            smartIndent: true,
            autofocus: true,
            mode: "css",
            theme: "idea",
            height: '100%',
            hintOptions: {
                completeSingle: true
            }
        }
        return (
            <div className={["typeset-editor"].join('')} >
                <div className="typeset-editor__header">
                    <BarItem icon={<LeftOutlined />} onClick={onClose} />
                    <div>{data.id ? '修改自定义主题' : '添加自定义主题'}</div>
                </div>
                <div className="typeset-editor__body" onKeyDown={this.onKeyDown} onKeyPressCapture={(e) => { e.stopPropagation() }}>
                    {<CodeMirror value={data.css} ref={(mirror: any) => { this.mirror = mirror }} options={options} onChange={this.onCodeChange}
                    ></CodeMirror>}
                </div>
                <div className="typeset-editor__bar">
                    <Input className="typeset-editor__title" value={title} onChange={this.onChangeTitle} placeholder="请填写自定义主题标题" />
                    <Button type="primary" disabled={!title} onClick={this.onCodeComplete}>保存</Button>
                </div>
            </div >
        )
    }
}