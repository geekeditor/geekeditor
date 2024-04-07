import React, { Component } from 'react'
import './Editor.less'
import MEditable from '@geekeditor/meditable';
import '@geekeditor/meditable/dist/assets/meditable.css'
import { IDocsNodeBase } from '../../types/docs';

export default class Editor extends Component<{
    customToolbar?: React.ReactNode;
    node: IDocsNodeBase;
}, {
}> {

    private container!: HTMLDivElement;
    private editable!: MEditable|null; 
    constructor(props: any) {
        super(props);

        this.state = {
        }
    }

    createEditor() {
        const { node } = this.props
        if (this.container) {
            this.editable = new MEditable({ container: this.container, locale: {lang: navigator.language}, diagramHtmlType: {mermaid: 'img'} })
            const {command} = this.editable.context
            command.registerCommand({
                cmdName: 'save',
                notNeedUndo: true,
                ignoreContentChange: true,
                execCommand: (cmdName: string) => {
                    this.editable && this.editable.trigger('save');
                },
                queryCommandState: (cmdName: string) => {
                    return 0;
                },
                shortcutKeys: {
                    "Ctrl+S": {}
                }
            })
    
            command.registerCommand({
                cmdName: 'search',
                notNeedUndo: true,
                ignoreContentChange: true,
                execCommand: (cmdName: string) => {
                    this.editable && this.editable.trigger('search');
                },
                queryCommandState: (cmdName: string) => {
                    return 0;
                },
                shortcutKeys: {
                    "Ctrl+F": {}
                }
            })
            this.editable.prepare().then(() => {
                node.setEditable(this.editable);
            })
        }
    }

    componentDidMount() {
        this.createEditor()
    }

    componentWillUnmount(): void {
        if(this.editable) {
            this.editable.destroy();
            this.editable = null;
        }
    }

    render() {
        return (
            <div className="editor" /*style={{ top: fullscreen ? `-31px` : `31px` }}*/>
                <div className="editor-inner">
                    <div className="editor-main">
                        <div className={["editor-core"].join(' ')} /*style={{ width: `calc(100% - ${barTabWidth+barNavWidth}px)` }}*/>
                            <div className="editable" ref={(val: any) => { this.container = val }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}