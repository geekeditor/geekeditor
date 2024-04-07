import { EDocsNodeType, EInitResultStatus, IDocsAssetLoadResult, IDocsAssetUploadResult, IDocsData, IDocsDataItem, IDocsImageHosting } from "../../../types/docs.d";
import { EPlatformType, IGiteeDataItem, PlatformGiteeRepoObj } from "../../../types/platform.d";
import GITEE, { BASET_HOST } from '../../../api/gitee'
import { Base64 } from 'js-base64'
import md5 from 'blueimp-md5'
import { dataURItoBlob } from "../../../utils/utils";
import GithubData from './github'


export default class GiteeData extends GithubData {
    constructor(options: { repo: PlatformGiteeRepoObj, imageHosting?: IDocsImageHosting }) {
        super(options)
    }

    protected initConfig() {
        const repo = this._repo as PlatformGiteeRepoObj;
        this._rootUrl = `${BASET_HOST}/repos/${repo.owner.login}/${repo.path}/contents`;
        this._archiveUrl = `${this._rootUrl}`;
        this._docsIndexUrl = `${this._archiveUrl}/index.md`
        this._assetsUrl = `${this._archiveUrl}/assets`;
        this._docsUrl = `${this._archiveUrl}/docs`;
        this._base = `https://gitee.com/${this._repo.owner.login}/${this._repo.name}/tree/master`
    }

    protected get CRUD() {
        return GITEE;
    }

    // get title() {
    //     return `Gitee[${this._repo.name}]`
    // }

    get platform() {
        return EPlatformType.EPlatformTypeGitee
    }
}