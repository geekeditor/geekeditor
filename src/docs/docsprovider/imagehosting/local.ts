import { EDocsNodeType, EInitResultStatus, IDocsData, IDocsDataItem, IDocsFileUploadResult, IDocsImageHosting } from "../../../types/docs.d";
import { ILocalDataItem } from "../../../types/platform";
import { Base64 } from 'js-base64'
import LOCAL from '../../../api/local'
import {seperator} from './utils'

export default class GithubImageHosting implements IDocsImageHosting {
    private _rootPath!: string;
    private _hostRegexs!: RegExp[];
    constructor(options: { rootPath: string }) {
        this._rootPath = options.rootPath;
        this._hostRegexs = [/\/file\?path=/]
    }

    async init(){
       return {status: EInitResultStatus.EInitResultStatusSuccess} 
    }

    uploadImage(file: File|Blob, onUploadProgress?: (progressEvent: any) => void) {

        return new Promise<undefined | IDocsFileUploadResult>((resolve) => {
            const date = new Date();
            const path =
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            const match = file.type.match(/image\/(.*)/);
            const type = match ? match[1] : 'jpg'
            reader.onload = (e) => {
                if (e.target && e.target.result && typeof e.target.result === 'string') {
                    const content = e.target.result.split(',').pop() || '';
                    const source = (file as any).path || ''
                    let name = `${date.getTime()}-${((file as File).name || `image`)}`;
                    const regex = new RegExp(`\.${type}$`)
                    type && !regex.test(name) && (name = `${name}.${type}`);
                    this.uploadFile(this._rootPath, path, name, content, source, onUploadProgress).then((value) => {
                        if (value) {
                            const result = {
                                filename: value.name,
                                url: `/file?path=${encodeURIComponent(value.fullpath)}`,
                            }
                            resolve(result)
                        } else {
                            resolve(undefined)
                        }
                    })
                } else {
                    resolve(undefined)
                }
            }

        });
    }

    uploadSVG(svg: string, onUploadProgress?: (progressEvent: any) => void): Promise<undefined | IDocsFileUploadResult> {
        return new Promise<undefined | IDocsFileUploadResult>((resolve) => {
            const date = new Date();
            const path =
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate();
                const name = `${date.getTime()}-svg.svg`;
                const content = Base64.encode(svg);
                this.uploadFile(this._rootPath, path, name, content, undefined, onUploadProgress).then((value) => {
                    if (value) {
                        const result = {
                            filename: value.name,
                            url: `/file?path=${encodeURIComponent(value.fullpath)}`,
                        }
                        resolve(result)
                    } else {
                        resolve(undefined)
                    }
                })

        });
    }

    checkHostMatched(url: string) {
        const some = this._hostRegexs.some((r)=>r.test(url))
        return some;
    }

    private uploadFile(rootUrl: string, path: string, name: string, content?:string, source?: string, onUploadProgress?: (progressEvent: any) => void): Promise<ILocalDataItem | undefined> {
        
        const docPath = `${path}${seperator}${name}`
        return LOCAL.put({
            path: `${rootUrl}${seperator}${docPath}`,
            type: 'image',
            content,
            source
        }, onUploadProgress).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: ILocalDataItem = response.data;
                return c;
            }
        })
    }
}