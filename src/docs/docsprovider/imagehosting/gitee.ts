import { EDocsNodeType, EInitResultStatus, IDocsData, IDocsDataItem, IDocsFileUploadResult, IDocsImageHosting } from "../../../types/docs.d";
import { IGiteeDataItem, PlatformGiteeRepoObj } from "../../../types/platform";
import GITEE, { BASET_HOST } from '../../../api/gitee'
import { Base64 } from "js-base64";




export default class GiteeImageHosting implements IDocsImageHosting {
    private _repo!: PlatformGiteeRepoObj;
    private _imageRootUrl!: string;
    private _imagesUrl!: string;
    private _hostRegexs!: RegExp[];
    constructor(options: { repo: PlatformGiteeRepoObj }) {
        this._repo = { ...options.repo };
        // this._imageJsdelivrUrl = `https://cdn.jsdelivr.net/gh/${this._repo.owner.login}/${this._repo.path}/images`;
        this._imageRootUrl = `${BASET_HOST}/repos/${this._repo.owner.login}/${this._repo.path}/contents`;
        this._imagesUrl = `${BASET_HOST}/repos/${this._repo.owner.login}/${this._repo.path}/contents/images`;
        this._hostRegexs = [new RegExp(`https://gitee.com/${this._repo.owner.login}/${this._repo.path}`)]

    }

    init() {
        return GITEE.get(this._imageRootUrl, this._repo.token).then((response: any) => {

            if (response.error) {

                if (response.data && response.data.message === 'Branch') {
                    return {
                        status: EInitResultStatus.EInitResultStatusNoBranch
                    }
                }

                return { status: EInitResultStatus.EInitResultStatusFail }
            }

            return {
                status: EInitResultStatus.EInitResultStatusSuccess
            };
        })
    }

    uploadImage(file: File | Blob, onUploadProgress?: (progressEvent: any) => void) {

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
                                url: value.download_url || '',
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
                        url: value.download_url || '',
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

    private uploadFile(rootUrl: string, token: string, path: string, name: string, content: string, onUploadProgress?: (progressEvent: any) => void): Promise<IGiteeDataItem | undefined> {
        const docPath = `${path}/${name}`
        return GITEE.put(`${rootUrl}/${docPath}`, token, {
            "message": "upload from GeekEditor",
            "content": content
        }, onUploadProgress).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGiteeDataItem = response.data.content;
                return c;
            }
        })
    }
}