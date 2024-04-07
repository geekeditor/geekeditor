
import { Base64 } from "js-base64";
import juice from "juice";
import { isLocal } from "../api/local";
import { version } from "../version";

declare var ClipboardItem: any;
export const copyContent = (content: Blob | string | { [type: string]: string }, types?: string[]) => {
    return new Promise((resolve) => {
        const copyContent = async (e: any) => {
            e = e || window.event;

            if (content instanceof Blob) {
                const text = await content.text()
                e.clipboardData.setData(content.type, text);
            } else if (typeof content !== 'string' && Object.keys(content).length) {

                Object.entries(content).forEach(([type, value]) => {
                    e.clipboardData.setData(type, value);
                })

            } else {
                if (types) {
                    types.forEach((type) => {
                        e.clipboardData.setData(type, content.toString());
                    })
                }
            }

            e.preventDefault();
            e.stopPropagation();
            document.removeEventListener('copy', copyContent);
            resolve(true);
        }

        document.addEventListener('copy', copyContent, true);
        document.execCommand('copy');
    })

}

export function canCopyBlob() {
    return typeof ClipboardItem !== 'undefined'
}

export async function copyBlob(blob: Blob) {
    if (canCopyBlob()) {
        const data = [
            new ClipboardItem({
                [blob.type]: blob
            })
        ]
        return (navigator.clipboard as any).write(data)
    }
}

export function download(filename: string, content: string | Blob, contentType?: string) {
    contentType = contentType || (content instanceof Blob ? (content as Blob).type : 'application/octet-stream')
    const a = document.createElement('a');
    const blob = new Blob([content], { 'type': contentType });

    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

export async function saveToDisk(filename: string, content: string | Blob, down?: boolean) {
    const supportFSA = typeof (window as any).showSaveFilePicker === 'function';
    if (!down && supportFSA && !isLocal()) {

        const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename
        });

        // Create a FileSystemWritableFileStream to write to.
        const writable = await (fileHandle as any).createWritable();
        // Write the contents of the file to the stream.
        await writable.write(content);
        // Close the file and write the contents to disk.
        writable.close();

    } else {
        download(filename, content);
    }
}

export async function print(content: string, title?: string) {
    const iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "100%");
    iframe.setAttribute("frameborder", "0");
    iframe.style.cssText = "display: none;";
    // iframe.src = './core.html';

    iframe.onload = (e: any) => {
        const contentWindow = e.target?.contentWindow as Window;
        const originalTitle = document.title;

        const removeIframe = () => {
            document.title = originalTitle;
            setTimeout(() => {
                iframe.remove()
            }, 1000)
        }
        if (!contentWindow) {
            removeIframe()
            return;
        }

        let doc = contentWindow.document as Document;
        doc.open();
        doc.domain = document.domain;
        doc.write(content);
        doc.close();

        contentWindow.onafterprint = () => {
            removeIframe()
        };
        if (title) {
            document.title = title;
        }
        contentWindow.print();

    };
    iframe.onerror = () => {
        iframe.remove()
    }

    document.body.appendChild(iframe);
}

export function getFileFullname(filename: string, type: 'html' | 'markdown' | 'pdf' | string) {
    const exts: { [key: string]: string } = {
        'html': '.html',
        'md': '.md',
        'pdf': '.pdf',
        'docx': '.docx',
        'image': '.png',
        'text': '.txt'
    }

    return `${filename}${exts[type] || ''}`
}

export async function selectDirectory(): Promise<string | undefined> {
    const LOCAL = (window as any).LOCAL;
    return LOCAL ? LOCAL.selectDirectory() : undefined;
};

export async function selectFSADirectory(): Promise<{ fsaId: string; dirHandle: any } | undefined> {
    const supportFSA = typeof (window as any).showDirectoryPicker === 'function';
    const fsaId = `fsa_${Date.now()}`
    if (!supportFSA) return undefined;
    const dirHandle = await (window as any).showDirectoryPicker({
        id: fsaId,
    })

    if (!dirHandle) {
        return undefined;
    }

    return {
        fsaId,
        dirHandle
    }
};

export const clearEmpty = (html: string) => {
    if (!html) {
        return html;
    }

    return html.replace(
        new RegExp(
            "[\\r\\t\\n ]*</?(\\w+)\\s*(?:[^>]*)>[\\r\\t\\n ]*",
            "g"
        ),
        function (a: string, b: string) {
            // br 暂时单独处理
            if (b && b.toLowerCase() === 'br') {
                return a.replace(/(^[\n\r]+)|([\n\r]+$)/g, "");
            }

            return a
                .replace(
                    new RegExp(
                        "^[\\r\\t\\n ]+"
                    ),
                    ""
                )
                .replace(
                    new RegExp(
                        "[\\r\\t\\n ]+$"
                    ),
                    ""
                );
        }
    );
}

export const inlineContent = (html: string, css: string, options?: juice.Options | undefined) => {
    options = options || {
        inlinePseudoElements: true,
        preserveImportant: true,
    }
    return juice.inlineContent(html, css, options)
};

export const getNowFormatDate = () => {
    const date = new Date();
    const seperator1 = "-";
    let year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    let strDate: any = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}


export const getImageRatio = (src: string) => {
    return new Promise<any>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            resolve(h > 0 ? w / h : NaN);
        };
        img.onerror = () => {
            resolve(NaN)
        }

    })
}

export const getImageSize = (src: string) => {
    return new Promise<any>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            resolve({ w, h });
        };
        img.onerror = () => {
            resolve({})
        }
    })
}

export function addUrlArgs(url: string, params: any): string {
    let com = url.split("#"),
        newUrl = com[0],
        hash = com[1],
        paramStrs = [];
    for (const name in params) {
        const value = params[name];
        null != value && paramStrs.push(name + "=" + encodeURIComponent(value.toString()));
    }
    return (
        newUrl.indexOf("?") > -1
            ? (newUrl += "&" + paramStrs.join("&"))
            : (newUrl += "?" + paramStrs.join("&")),
        hash ? newUrl + "#" + hash : newUrl
    );
}

export function getUrlArgs(url: string): any {
    void 0 === url && (url = window.location.href);
    let paramStrs = url.split("#")[0].split("?")[1];
    if (!paramStrs) return {};
    let args: any = {}
    for (let i = 0, params = paramStrs.split("&"); i < params.length; i++) {
        let option = params[i],
            index = option.indexOf("=");
        if (!(index < 0)) {
            let name = option.substr(0, index),
                value = option.substr(index + 1);
            if (!args[name]) {
                let d: any;
                try {
                    d = decodeURIComponent(value);
                } catch (e) {
                    d = value;
                }
                args[name] = d;
            }
        }
    }
    return args;
}

export function bindEvent(target: HTMLElement | Document | Window, event: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined) {
    if (!target) return false;
    target.addEventListener(event, listener, options);
}

export function unbindEvent(target: HTMLElement | Document | Window, event: string, listener: EventListenerOrEventListenerObject) {
    if (!target) return false;
    target.removeEventListener(event, listener);
}

export function regexWithSearchKey(key: string) {
    const words = [];
    for (let i = 0; i < key.length; i++) {
        words.push(`(${key.charAt(i)})`)
    }
    return new RegExp(`(.*)${words.join('(.*)')}(.*)`)
}

export function enterFullscreen() {
    const doc = document as any;
    if (doc.webkitIsFullScreen || doc.mozFullScreen) {
        return false;
    }
    const docElm: any = document.documentElement;
    //W3C
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    }
    //FireFox
    else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    }
    //Chrome等
    else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
    //IE11
    else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    }
    return true;
}

export function exitFullscreen() {
    const doc = document as any;
    if (doc.webkitIsFullScreen || doc.mozFullScreen) {
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.webkitCancelFullScreen) {
            doc.webkitCancelFullScreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        }
        return true;
    }
    return false;
}

export function toggleFullscreen() {
    const LOCAL = (window as any).LOCAL;
    if (LOCAL && LOCAL.toggleFullscreen) {
        LOCAL.toggleFullscreen()
        return;
    }
    const doc = document as any;
    if (doc.webkitIsFullScreen || doc.mozFullScreen) {
        exitFullscreen()
    } else {
        enterFullscreen();
    }
}

export function setAlwaysOnTop(flag: boolean): Promise<boolean> {

    const LOCAL = (window as any).LOCAL;
    if (LOCAL && LOCAL.toggleFullscreen) {
        return LOCAL.setAlwaysOnTop(flag)
    }

    return Promise.resolve(false);
}

export function blobToDataURI(blob: Blob):Promise<string|null> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (e) => {
            if (e.target && e.target.result && typeof e.target.result === 'string') {
                resolve(e.target.result)
            } else {
                resolve(null)
            }
        }
        reader.onerror = () => {
            resolve(null)
        }
    })
}

export function dataURItoBlob(dataURI: string) {
    const dataArr = dataURI.split(',')
    const byteString = atob(dataArr[1])
    const mimeString = dataArr[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
}

export function svgToBlob(svg: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.src = `data:image/svg+xml;base64,${Base64.encode(svg)}`;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        }
        img.onerror = () => {
            resolve(null)
        }
    })
}

export function svgToDataURIWithType(svg: string, type?: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.src = `data:image/svg+xml;base64,${Base64.encode(svg)}`;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            resolve(canvas.toDataURL(type || 'image/png'))
        }
        img.onerror = () => {
            resolve(null)
        }
    })
}

export function datURIToDataURIWithType(dataURI: string, type?: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.src = dataURI;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            resolve(canvas.toDataURL(type || 'image/png'))
        }
        img.onerror = () => {
            resolve(null)
        }
    })
}


export function svgToDataURI(svg: string) {
    return `data:image/svg+xml;base64,${Base64.encode(svg)}`
}

export const isElectron = isLocal()
export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
export const isWindows = /windows/i.test(navigator.userAgent);
// export const appDownloadUrl = isMac ? `https://cdn.montisan.cn/GeekEditor-${version.substring(1)}.dmg` : isWindows ? `https://cdn.montisan.cn/GeekEditor-Setup-${version.substring(1)}.exe` : `https://cdn.montisan.cn/geekeditor_${version.substring(1)}_amd64.deb`
// export const appDownloadUrl = `https://cdn.montisan.cn/geekeditor-extension.zip`
export const appDownloadUrl = `/`

export const versionStringCompare = (preVersion = '', lastVersion = '') => {
    var sources = preVersion.split('.');
    var dests = lastVersion.split('.');
    var maxL = Math.max(sources.length, dests.length);
    var result = 0;
    for (let i = 0; i < maxL; i++) {
        let preValue = sources.length > i ? sources[i] : '0';
        let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt(0) : Number(preValue);
        let lastValue = dests.length > i ? dests[i] : '0';
        let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt(0) : Number(lastValue);
        if (preNum < lastNum) {
            result = -1;
            break;
        } else if (preNum > lastNum) {
            result = 1;
            break;
        }
    }
    return result;
}


export function downloadURL(url: string): Promise<Blob | null> {
    return new Promise((resolve) => {
        const proxyManager = (window as any).proxyManager;
        if (proxyManager && proxyManager.download) {
            proxyManager.download(url, (dataURL: string) => {
                if (typeof dataURL === 'string') {
                    resolve(dataURItoBlob(dataURL))
                } else {
                    resolve(null)
                }
            })
        } else {
            resolve(null)
        }
    })
}

export function strikeline2Hump(s: string) {
    return s.replace(/-(\w)/g, function (all, letter) {
        return letter.toUpperCase()
    })
}

export function hump2Strikeline(data: string) {
    return data.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1);
}

export function dateFormat(fmt: string, date: Date) {
    let ret;
    const opt:any = {
        "Y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
    }
    for (const k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
    }
    return fmt;
}


export function dateStringFormat(dateString?: string) {
    if(!dateString) return '';
    const date = new Date(dateString);

    return dateFormat('YYYY/MM/dd HH:mm:ss', date);
}