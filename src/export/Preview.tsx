
import React, { Component, SyntheticEvent } from "react"
export default class ExportPreview extends Component<{
    richText: string;
}, {
    }> {
    private _head!: HTMLHeadElement;
    private _article!: HTMLDivElement;
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }

    
    onPreviewLoad(event: SyntheticEvent<HTMLIFrameElement, Event>) {

        const html =
            "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "<meta name='referrer' content='never'>" +
            "<meta charset='utf-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no'>" +
            "<style type='text/css'>" +
            "html,body{font-family:sans-serif;font-size:16px; margin: 0; box-sizing: border-box;width: 100%;height: 100%;}" +
            "article{margin: 16px auto;width: 375px;background-color: #fff;border: 1px solid #e8e8e8;box-shadow: 0 2px 8px rgb(115 115 115 / 8%);min-height: auto;}"+
            "</style>" +
            "</head>" +
            "<body><article>" +
            (this.props.richText || '') +
            "</article></body>" +
            "</html>";

        const iframe = event.target as HTMLIFrameElement;
        let doc = iframe.contentWindow?.document as Document;
        this._head = doc.head;
        doc.open();
        doc.domain = document.domain;
        doc.write(html);
        doc.close();

        this._article = doc.querySelector("article") as HTMLDivElement;

    }

    setTypeset(typesetId: string, styleText: string) {
        if (this._head) {
            const id = 'gk-typeset'
            let element = this._head.querySelector("#" + id);
            element?.remove();

            const style = document.createElement("style");
            style.textContent = `\n${styleText}`;
            let attrs: any = {
                type: "text/css",
                id,
                typesetId
            }
            for (const key in attrs) {
                const value = attrs[key];
                style.setAttribute(key, value);
            }
            this._head.appendChild(style);
        }
    }

    componentDidUpdate(prevProps: Readonly<{ richText: string; }>, prevState: Readonly<any>, snapshot?: any): void {
        if (prevProps.richText != this.props.richText) {

            if(this._article) {
                this._article.innerHTML = this.props.richText;
            }

        }
    }

    
    render() {
        return (
            <div className="preview">
                <iframe style={{ border: 'none', width: '100%', height: '100%' }} width={'100%'} height={'100%'} frameBorder={0} onLoad={this.onPreviewLoad.bind(this)}></iframe>
            </div>
        )
    }
}