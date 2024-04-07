
import React, { Component, SyntheticEvent } from "react"
import Typeset from "./typeset";
import SketchBar from "../widgets/SketchBar";
import { Button, message } from "antd";
import { appDownloadUrl, canCopyBlob, copyBlob, copyContent, getFileFullname, inlineContent, print, saveToDisk } from "../utils/utils";
import { convertRepoImages, convertSvgXmlDataUri, exportDocx, exportImage, formatHTML, loadContentImages, loadRepoImages } from "./format";
import { CopyOutlined, ExportOutlined, SyncOutlined } from "@ant-design/icons";
import i18n from "../i18n";

const TypeTitles:{[key: string]: {copy: string; export: string}} = {
    "wechat": {
        copy: "export.copyToOA",
        export: "common.synchronize"
    },
    "image": {
        copy: "export.copyImage",
        export: "export.exportImage"
    },
    "html": {
        copy: "export.copyHTML",
        export: "export.exportHTML"
    },
    "pdf": {
        copy: "export.copyPDF",
        export: "export.exportPDF"
    }
}

export interface Post {
    title: string;
    summary?: string;
    cover?: string;
    htmls: { [key: string]: string }
    id: string;
}
export default class ExportController extends Component<{
    content: string;
    type: string;
    title: string;
    id: string;
    onComplete: () => void;
}, {
    sideBarWidth: number;
    lastSideBarWidth: number;
    richText: string;
    copying: boolean;
    downloading: boolean;
}> {

    private _article!: HTMLElement;
    private _doc!: Document;
    constructor(props: any) {
        super(props);
        this.state = {
            sideBarWidth: 300,
            lastSideBarWidth: 300,
            richText: "",
            copying: false,
            downloading: false
        }
    }

    onUpdateTypeset = (typesetText: string) => {
        const richText = inlineContent(`<section class="ge-content">${this.props.content}</section>`, typesetText);
        this.setState({
            richText
        })
    }

    onSketchStart = () => {
        this.setState({
            lastSideBarWidth: this.state.sideBarWidth
        })
    }

    onSketchChange = (width: number) => {
        const newWidth = Math.min(Math.max(width, 200), 500);
        this.setState({
            sideBarWidth: newWidth
        })
    }

    onSketchEnd = () => {
    }

    onCopying = async () => {
        const {type, onComplete} = this.props;
        if(this._doc) {
            this.setState({
                copying: true
            })
            let content = this._article.innerHTML;
            if(content) {
    
                if(type === 'image') {
                    const blob = await exportImage(content, this._doc) as Blob;
                    if(blob) {
                        copyBlob(blob).then(()=>{
                            message.success(i18n.t("common.copied"))
                        })
                    }
                    this.setState({
                        copying: false
                    })
                    return;
                }
    
                if(type === 'wechat') {
                    content = await convertSvgXmlDataUri(content);
                }
    
                const copyTypes = ['text/plain'];
                    ['wechat'].indexOf(type) !== -1 && copyTypes.push('text/html');
                copyContent(content, copyTypes).then(()=>{
                    message.success(i18n.t("common.copied"))
                })
            }
            this.setState({
                copying: false
            })
        }
    }

    onDownloading = async () => {
        const {type, title, onComplete} = this.props;
        if (this._doc) {
            this.setState({
                downloading: false
            })
            let content = this._article.innerHTML;
            const fullname = getFileFullname(title, type);

            if (type === 'image') {
                const blob = await exportImage(content, this._doc) as Blob;
                if (blob) {
                    saveToDisk(fullname, blob)
                }
                this.setState({
                    downloading: false
                })
                return;
            }

            if (content) {
                content = await formatHTML(content, {title, summary: ""}, type === 'docx');

                if (type === 'pdf' || type === 'print') {
                    print(content, title)
                } else if (type === 'docx') {
                    const blob = await exportDocx(content);
                    if (blob) {
                        saveToDisk(fullname, blob)
                    }
                } else {
                    saveToDisk(fullname, content)
                }
            }
        }
    }

    
    onSync = async () => {
        
        const syncManager = (window as any).syncManager
        if(syncManager) {
            const {richText} = this.state
            const {title, id} = this.props
            const post: Post = {
                title,
                htmls: {"wechat": convertRepoImages(richText, id)},
                id
            }
            syncManager.sync([post])

        } else {
            message.info(<><span><a target="_blank" href={appDownloadUrl}>{i18n.t("settings.installExtension")}</a>{i18n.t("settings.syncOAActicles")}</span></>)
        }
    }
    

    async onPreviewLoad(event: SyntheticEvent<HTMLIFrameElement, Event>) {

        const html =
            "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "<meta name='referrer' content='never'>" +
            "<meta charset='utf-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no'>" +
            "<style type='text/css'>" +
            "html,body{font-family:sans-serif;font-size:16px; margin: 0; box-sizing: border-box;width: 100%;height: 100%;}" +
            "article{margin: 16px auto;width: 405px;padding: 30px 15px;background-color: #fff;border: 1px solid #e8e8e8;box-shadow: 0 2px 8px rgb(115 115 115 / 8%);min-height: auto;}" +
            "</style>" +
            "</head>" +
            "<body></body>" +
            "</html>";

        const iframe = event.target as HTMLIFrameElement;
        let doc = iframe.contentWindow?.document as Document;
        this._doc = doc;
        doc.open();
        doc.domain = document.domain;
        doc.write(html);
        doc.close();

        const div = document.createElement('div');
        div.style.cssText = 'display:inline-block;width:100%;'
        doc.body.appendChild(div);

        this._article = document.createElement('article');
        div.appendChild(this._article);
        this._article.innerHTML = await loadContentImages(this.state.richText);

    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevState.richText != this.state.richText) {
            if (this._article) {
                loadContentImages(this.state.richText).then((innerHTML)=>{
                    this._article.innerHTML = innerHTML;
                })
            }
        }
    }

    render() {
        const { sideBarWidth, lastSideBarWidth, downloading, copying } = this.state;
        const { type } = this.props;
        const copyEnabled = type === 'image' ? canCopyBlob() : true
        const copyText = i18n.t(TypeTitles[type].copy)
        const exportText = i18n.t(TypeTitles[type].export)
        return (
            <div className="export-controller">
                <div className="export-controller-preview" style={{ width: `calc(100% - ${sideBarWidth}px)` }}>
                    <div className="preview">
                        <iframe style={{ border: 'none', width: '100%', height: '100%' }} width={'100%'} height={'100%'} frameBorder={0} onLoad={this.onPreviewLoad.bind(this)}></iframe>
                    </div>
                </div>
                <div className="export-controller-operation" style={{ width: `${sideBarWidth}px` }}>
                    <div className="export-controller-settings">
                        <Typeset onUpdateTypeset={this.onUpdateTypeset} />
                    </div>
                    <div className="export-controller-bar">
                        {type !== 'pdf' && <Button onClick={this.onCopying} disabled={!copyEnabled} icon={<CopyOutlined/>} loading={copying}>{copyText}</Button>}
                        {type === 'wechat' ? <Button icon={<SyncOutlined />} loading={downloading} onClick={this.onSync}>{exportText}</Button> :
                        <Button icon={<ExportOutlined />} loading={downloading} onClick={this.onDownloading}>{exportText}</Button>}
                        
                    </div>
                    <SketchBar placementLeft={true} width={lastSideBarWidth} onStart={this.onSketchStart} onEnd={this.onSketchEnd} onChange={this.onSketchChange} />
                </div>
            </div>
        )
    }
}