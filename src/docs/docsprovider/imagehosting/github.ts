import { EDocsNodeType, EInitResultStatus, IDocsData, IDocsDataItem, IDocsFileUploadResult, IDocsImageHosting } from "../../../types/docs.d";
import { IGithubDataItem, PlatformGithubRepoObj } from "../../../types/platform";
import GITHUB from '../../../api/github'
import { Base64 } from 'js-base64'
import resolve from "resolve";




export default class GithubImageHosting implements IDocsImageHosting {
    private _repo!: PlatformGithubRepoObj;
    private _imageJsdelivrUrl!: string;
    private _imagesUrl!: string;
    private _imageRootUrl!: string;
    private _hostRegexs!: RegExp[];
    constructor(options: { repo: PlatformGithubRepoObj }) {
        this._repo = { ...options.repo };
        this._imageJsdelivrUrl = `https://cdn.jsdelivr.net/gh/${this._repo.owner.login}/${this._repo.name}/images`;
        this._imageRootUrl = `https://api.github.com/repos/${this._repo.owner.login}/${this._repo.name}/contents`;
        this._imagesUrl = `https://api.github.com/repos/${this._repo.owner.login}/${this._repo.name}/contents/images`;
        this._hostRegexs = [new RegExp(`https://cdn.jsdelivr.net/gh/${this._repo.owner.login}/${this._repo.name}`), new RegExp(`https://raw.githubusercontent.com/${this._repo.owner.login}/${this._repo.name}`)]
    }

    init() {
        return GITHUB.get(this._imageRootUrl, this._repo.token).then((response: any) => {

            if (response.error) {
                return {status: EInitResultStatus.EInitResultStatusFail}
            }

            return {
                status: EInitResultStatus.EInitResultStatusSuccess
            };
        })
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
                    let name = `${date.getTime()}-${((file as File).name || `image`)}`;
                    const regex = new RegExp(`\.${type}$`)
                    type && !regex.test(name) && (name = `${name}.${type}`);
                    this.uploadFile(this._imagesUrl, this._repo.token, path, name, content, onUploadProgress).then((value) => {
                        if (value) {
                            const result = {
                                filename: value.name,
                                url: encodeURI(`${this._imageJsdelivrUrl}/${path}/${name}`),
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
            this.uploadFile(this._imagesUrl, this._repo.token, path, name, content, onUploadProgress).then((value) => {
                if (value) {
                    const result = {
                        filename: value.name,
                        url: encodeURIComponent(`${this._imageJsdelivrUrl}/${path}/${name}`),
                    }
                    resolve(result)
                } else {
                    resolve(undefined)
                }
            })

        });
    }

    checkHostMatched(url: string) {
        return this._hostRegexs.some((r)=>r.test(url))
    }

    private uploadFile(rootUrl: string, token: string, path: string, name: string, content: string, onUploadProgress?: (progressEvent: any) => void): Promise<IGithubDataItem | undefined> {
        const docPath = `${path}/${name}`
        return GITHUB.put(`${rootUrl}/${docPath}`, token, {
            "message": "upload from GeekEditor",
            "content": content
        }, onUploadProgress).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGithubDataItem = response.data.content;
                return c;
            }
        })
    }
}