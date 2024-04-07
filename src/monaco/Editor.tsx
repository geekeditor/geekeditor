import React, { Component } from 'react'
import MonacoEditor from 'react-monaco-editor'
import MonacoBridge from './MonacoBridge';
import { IDocsNodeBase } from '../types/docs';

export default class Editor extends Component<{
    node: IDocsNodeBase;
}, {
    content: string;
}> {

    private _bridge!: MonacoBridge;
    constructor(props: any) {
        super(props);

        this.state = {
            content: ""
        }

        this._bridge = new MonacoBridge({
            getValue: ()=> {
                return this.state.content;
            },
            setValue: (value: string)=>{
                this.setState({
                    content: value
                }, () => {
                    this._bridge.trigger("aftersetcontent")
                })
            }
        })
    }

    editorDidMount(editor:any) {
        const {node} = this.props;
        editor.focus();
        if(node.setMonacoBridge) {
            node.setMonacoBridge(this._bridge)
        }
    }

    onContentChange(newValue: string) {
        this.setState({
            content: newValue
        }, ()=>{
            this._bridge.trigger("contentchange")
        })
    }

    render() {
        const {node} = this.props;
        const extension = (node.extension || '').toLowerCase();
        const language = /\.js$/.test(extension) ? 'javascript' : /\.html/.test(extension) ? 'html' : /\.css/.test(extension) ? 'css' : '';
        const {content} = this.state;
        const options = {
            automaticLayout: true,
            selectOnLineNumbers: true,
            minimap: {
                enabled: true
            },
            scrollBeyondLastLine: true,
            colorDecorators: true
        }

        return (
            <div className="editor" /*style={{ top: fullscreen ? `-31px` : `31px` }}*/>
                <MonacoEditor language={language} value={content} options={options} onChange={this.onContentChange.bind(this)} editorDidMount={this.editorDidMount.bind(this)}/>
            </div>
        )
    }
}