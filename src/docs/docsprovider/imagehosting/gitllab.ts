import { EDocsNodeType, EInitResultStatus, IDocsData, IDocsDataItem, IDocsFileUploadResult, IDocsImageHosting } from "../../../types/docs.d";
import { IGiteeDataItem, IGitlabPutResData, PlatformGitlabRepoObj } from "../../../types/platform";
import GITLAB, { BASET_HOST } from '../../../api/gitlab'
import { Base64 } from "js-base64";




export default class GitlabImageHosting implements IDocsImageHosting {
    private _repo!: PlatformGitlabRepoObj;
    private _imageTreeUrl!: string;
    private _imagesUrl!: string;
    private _downloadUrl!: string;
    private _hostRegexs!: RegExp[];
    private _branch = 'main';
    constructor(options: { repo: PlatformGitlabRepoObj }) {
        this._repo = { ...options.repo };
        // this._imageJsdelivrUrl = `https://cdn.jsdelivr.net/gh/${this._repo.owner.login}/${this._repo.path}/images`;
        this._imageTreeUrl = `${BASET_HOST}/projects/${this._repo.id}/repository/tree`;
        this._imagesUrl = `${BASET_HOST}/projects/${this._repo.id}/repository/files/`; // https://gitlab.com/montisan/images/-/raw/main/WechatIMG232.jpeg?inline=false
        this._downloadUrl = `https://gitlab.com/${this._repo.owner.login}/${this._repo.name}/-/raw/${this._branch}/`
        this._hostRegexs = [new RegExp(`https://gitlab.com/${this._repo.owner.login}/${this._repo.name}`)]

    }

    init() {
        return GITLAB.get(this._imageTreeUrl, this._repo.token).then((response: any) => {

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
                    this.uploadFile(this._repo.token, path, name, content, onUploadProgress).then((value) => {
                        if (value) {
                            const result = {
                                filename: name,
                                url: this.getDownloadURL(value.file_path),
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
            this.uploadFile(this._repo.token, path, name, content, onUploadProgress).then((value) => {
                if (value) {
                    const result = {
                        filename: name,
                        url: this.getDownloadURL(value.file_path),
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

    private uploadFile(token: string, path: string, name: string, content: string, onUploadProgress?: (progressEvent: any) => void): Promise<IGitlabPutResData | undefined> {
        const docPath = `${path}/${name}`
        return GITLAB.put(this.getFileURL(docPath), token, {
            "commit_message": "upload from GeekEditor",
            "encoding": "base64",
            "content": content
        },false, onUploadProgress).then((response: any) => {
            if (response.status >= 200 && response.status <= 400) {
                const c: IGitlabPutResData= response.data;
                return c;
            }
        })
    }

    private getFileURL(path: string) {
        return `${this._imagesUrl}${encodeURIComponent('images/'+path)}?ref=${this._branch}&branch=${this._branch}`
    }

    private getDownloadURL(path: string) {
        return `${this._downloadUrl}${path}`
    }
}