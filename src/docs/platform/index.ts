import { EPlatformType, PlatformParams, PlatformType } from "../../types/platform.d";
import { isLocal } from '../../api/local';

import PlatformGithub from "./PlatformGithub"
import PlatformGithubInfo from './PlatformGithubInfo'
import PlatformGitee from "./PlatformGitee"
// import PlatformGiteeInfo from './PlatformGiteeInfo'
import PlatformBrowser from './PlatformBrowser'
import PlatformBrowserInfo from './PlatformBrowserInfo'
import PlatformLocal from './PlatformLocal'
import PlatformLocalInfo from './PlatformLocalInfo'
import PlatformFSA from './PlatformFSA'
import PlatformFSAInfo from './PlatformFSAInfo'
import PlatformGitlab from './PlatformGitlab'
import i18n from "../../i18n";
// import PlatformGitlabInfo from './PlatformGitlabInfo'

export const docs: {
    [key: number]: {
        type: EPlatformType,
        name: string,
        edit: React.ComponentType<any>,
        info: React.ComponentType<any>,
        hide?: boolean
    }
} = {}
const supportFSA = typeof (window as any).showDirectoryPicker === 'function';
if(isLocal()) {
    docs[EPlatformType.EPlatformTypeLocal] = {
        type: EPlatformType.EPlatformTypeLocal,
        name: i18n.t("settings.localDisk"),
        edit: PlatformLocal,
        info: PlatformLocalInfo
    }
} else {
    if(supportFSA) {
        docs[EPlatformType.EPlatformTypeFSA] = {
            type: EPlatformType.EPlatformTypeFSA,
            name: i18n.t("settings.localDisk"),
            edit: PlatformFSA,
            info: PlatformFSAInfo
        }
    } else {
        docs[EPlatformType.EPlatformTypeBrowser] = {
            type: EPlatformType.EPlatformTypeBrowser,
            name: i18n.t("settings.browserDatabase"),
            edit: PlatformBrowser,
            info: PlatformBrowserInfo
        }
    }
}

docs[EPlatformType.EPlatformTypeGithub] = {
    type: EPlatformType.EPlatformTypeGithub,
    name: 'GitHub',
    edit: PlatformGithub,
    info: PlatformGithubInfo
}
docs[EPlatformType.EPlatformTypeGitee] = {
    type: EPlatformType.EPlatformTypeGitee,
    name: 'Gitee',
    edit: PlatformGitee,
    info: PlatformGithubInfo
}
docs[EPlatformType.EPlatformTypeGitlab] = {
    type: EPlatformType.EPlatformTypeGitlab,
    name: 'GitLab',
    edit: PlatformGitlab,
    info: PlatformGithubInfo
}

export const hostings: {
    [key: number]: {
        type: EPlatformType,
        name: string,
        edit: React.ComponentType<any>,
        info: React.ComponentType<any>,
        hide?: boolean
    }
} = {}

if(isLocal()) {
    hostings[EPlatformType.EPlatformTypeLocal] = {
        type: EPlatformType.EPlatformTypeLocal,
        name: i18n.t("settings.localDisk"),
        edit: PlatformLocal,
        info: PlatformLocalInfo,
        hide: true
    }
}

hostings[EPlatformType.EPlatformTypeGithub] = {
    type: EPlatformType.EPlatformTypeGithub,
    name: 'GitHub',
    edit: PlatformGithub,
    info: PlatformGithubInfo,
}
hostings[EPlatformType.EPlatformTypeGitee] = {
    type: EPlatformType.EPlatformTypeGitee,
    name: 'Gitee',
    edit: PlatformGitee,
    info: PlatformGithubInfo,
    hide: true
}
hostings[EPlatformType.EPlatformTypeGitlab] = {
    type: EPlatformType.EPlatformTypeGitlab,
    name: 'GitLab',
    edit: PlatformGitlab,
    info: PlatformGithubInfo
}
/*
hostings[EPlatformType.EPlatformTypePicGo] = {
    type: EPlatformType.EPlatformTypePicGo,
    name: 'PicGo',
    edit: PlatformPicGo,
    info: PlatformPicGoInfo
}
*/