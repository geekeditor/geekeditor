import { HTMLParser } from '@geekeditor/meditable'
import domtoimage from "../lib/dom-to-image";
import { dataURItoBlob, blobToDataURI, getUrlArgs } from "../utils/utils";
import factory from "../docs/docsprovider/DocsProviderFactory";
import htmlDocx from 'html-docx-js/dist/html-docx';
import { MEVNode } from '@geekeditor/meditable/dist/types/modules/editable/parser';
import i18n from '../i18n';


function getDataURI(image: HTMLImageElement) {
    const providerID = image.dataset.assetRepo;
    const docId = image.dataset.assetDoc;
    const assetName = image.dataset.assetName;

    if (providerID && docId && assetName) {
        return factory.loadAsset(providerID, docId, assetName).then(blobToDataURI)
    }

    const src = image.src;
    const match = /assets\/([^\?]*)\?r=(.*)/.exec(src)
    if (match) {
        return factory.loadAsset(match[2], '', decodeURIComponent(match[1])).then(blobToDataURI)
    }

    return Promise.resolve(src)
}

export const loadRepoImages = async (el: HTMLElement) => {
    await domtoimage.impl.images.convertDataUriAll(el, getDataURI)
}

export const footer = `<section style="font-size: 12px; display: flex; align-items: center; justify-content: center; line-height: 2; color: rgba(112, 118, 132, 0.3); margin-top: 20px;margin-bottom: 10px;"><img src="data:image/png;base64,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" style="height: 16px;margin-right:2px;vertical-align: middle" />${i18n.t("landing.geekEditor")}|GeekEditor.com</section>`

export const formatHTML = async (content: string, basic: { title: string; summary: string }, convertSvgXml?: boolean) => {
    const node = document.createElement('div');
    node.innerHTML = content;
    await domtoimage.impl.images.convertDataUriAll(node, getDataURI)
    if (convertSvgXml) {
        await domtoimage.impl.images.convertSvgXmlDataUriAll(node);
    }
    const root = HTMLParser(node.innerHTML)
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${basic.summary}" />
    <title>${basic.title}</title>
</head>
<body>
<article style="margin: auto; max-width: 725px">
${root.outerHTML(true)}
</article>
</body>
</html>
`
    return html;
}

export const convertSvgXmlDataUri = async (content: string) => {
    const node = document.createElement('div');
    node.innerHTML = content;
    await domtoimage.impl.images.convertSvgXmlDataUriAll(node)
    return node.innerHTML;
}

export const exportImage = async (content: string, doc: Document, base64?: boolean) => {

    const padding = 20;
    const width = 375;
    const node = document.createElement('div');
    node.style.cssText = `box-sizing: border-box;white-space: normal;padding: ${padding}px;position: relative;margin: auto;width: ${width}px;background-color: #ffffff;`;

    node.innerHTML = content;
    await domtoimage.impl.images.inlineAll(node, getDataURI);

    const container = doc.createElement('div');
    container.style.cssText = 'height: 0px;overflow: hidden;';
    doc.body.appendChild(container);

    const target = doc.createElement('div');
    target.style.cssText = `width:${width * 2}px;margin: auto;display:inline-block;background-color:#ffffff;`
    container.appendChild(target);
    target.appendChild(node);


    // await new Promise((resolve)=>{
    //     setTimeout(()=>{
    //         resolve(true)
    //     }, 0)
    // })
    await Promise.resolve(true);


    const contentHeight = node.offsetHeight;

    target.style.height = contentHeight * 2 + 'px';
    node.style.cssText = `transform: translateY(${contentHeight / 2}px) scale(2);` + node.style.cssText;

    if (base64) {
        return domtoimage.toPng(target, {}).finally(() => {
            container.remove();
        })
    }

    return domtoimage.toPng(target, {}).then(dataURItoBlob).finally(() => {
        container.remove();
    })
}

export const exportDocx = async (content: string) => {
    return htmlDocx.asBlob(content)
}

export const loadMarkdownDocAsset = async (content: string) => {
    const pattern = /!\[(.*?)\]\((.*?)\)/mg;
    let matcher;

    while ((matcher = pattern.exec(content)) !== null) {
        const url = matcher[2];
        let match;
        if (url && (match = url.match(/assets\/(.*)\?r=/))) {

            const args = getUrlArgs(url);
            const assetName = match[1];
            // const assetDoc = args.assetDoc;
            const assetRepo = args.r;

            if (assetName && assetRepo) {
                const dataRUI = await factory.loadAsset(assetRepo, "", assetName).then(blobToDataURI);
                if (dataRUI) {
                    content = content.replace(url, dataRUI)
                }
            }
        }
    }

    return content;

}

export const loadContentImages = async (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    await loadRepoImages(div);
    return div.innerHTML;
}

export const convertRepoImages = (html: string, docId: string) => {

    const root = HTMLParser(html)

    const images = root.getNodesByTagNames('img')
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = img.attr('src') || '';
        const match = /assets\/([^\?]*)\?r=(.*)/.exec(src)
        if (match) {
            img.attr('data-asset-name', match[1]);
            img.attr('data-asset-doc', docId);
            img.attr('data-asset-repo', match[2]);
            img.attr('src', "")
        }

    }

    return root.outerHTML()
}