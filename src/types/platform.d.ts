export enum EPlatformType {
    EPlatformTypeNone = -1,
    EPlatformTypeBuiltin,
    EPlatformTypeBrowser,
    EPlatformTypeLocal,
    EPlatformTypeFSA,
    EPlatformTypeGithub,
    EPlatformTypeGitee,
    EPlatformTypeGitlab,
    EPlatformTypeCoding,
    EPlatformTypeSMMS,
    EPlatformTypeImgur,
    EPlatformTypePicGo
}

export interface PlatformGithub {
    token: string;
    doc_repo: string;
    image_repo: string;
}

export interface PlatformGitee {
    token: string;
    doc_repo: string;
    image_repo: string;
}


export type PlatformType = PlatformGithub | PlatformGitee;

export interface PlatformParams {
    platform: EPlatformType;
    token: string;
    repo: string;
}

export interface PlatformGithubRepoObj {
    name: string;
    owner: {
        login: string
    };
    private: boolean;
    token: string;
}

export interface IGithubDataItem {
    name: string;
    path: string;
    size: number;
    url: string;
    download_url?: string | null;
    type: string;
    sha: string;
    content?: string;
}

export interface PlatformGiteeRepoObj {
    name: string;
    path: string;
    owner: {
        login: string
    };
    private: boolean;
    token: string;
}

export interface IGiteeDataItem {
    name: string;
    path: string;
    size: number;
    url: string;
    download_url?: string | null;
    type: string;
    sha: string;
    content?: string;
}

export interface PlatformGitlabRepoObj {
    name: string;
    id: string;
    owner: {
        login: string
    };
    private: boolean;
    token: string;
}

export interface IGitlabTreeItem {
    id: string;
    name: string;
    path: string;
    type: 'tree' | 'blob';
    mode: string;
}

export interface IGitlabDataItem {
    file_name: string;
    file_path: string;
    size: number;
    encoding: string;
    content: string;
    ref: string;
    blob_id: string;
    commit_id: string;
    last_commit_id: string;
}

export interface IGitlabPutResData {
    file_path: string;
    branch: string;
}

export interface ILocalDataItem {
    name: string;
    fullpath: string;
    size: number;
    type: string;
    content?: string;
}

export interface PlatformFSARepoObj {
    name: string;
    fsaId: string;
}

export interface PlatformQiniuRepoObj {
    accessKey: string;
    secretKey: string;
    bucket: string;
    url: string;
    area: string;
    query: string;
    path: string;
}

export interface IQiniuResData {
    key?: string;
}