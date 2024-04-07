import { EDocsProviderType, EInitResultStatus, IDocsCreateDAO, IDocsData, IDocsDataItem, IDocsImageHosting, IDocsNodeBase, IDocsProviderSettingInfo } from "../../types/docs.d";
import { EPlatformType, PlatformFSARepoObj, PlatformGiteeRepoObj, PlatformGithubRepoObj, PlatformGitlabRepoObj, PlatformParams } from "../../types/platform.d";
import GithubData from "./data/github";
import GiteeData from "./data/gitee";
import GitlabData from "./data/gitlab"
import BuiltinData from "./data/builtin";
import BrowserData from "./data/browser";
import LocalData from './data/local';
import FSAData from "./data/fsa";

import DocsNode from "./DocsNode";
import GithubImageHosting from "./imagehosting/github";
import GitheeImageHosting from "./imagehosting/gitee";
import GitlabImageHosting from "./imagehosting/gitllab";
import LocalImageHosting from "./imagehosting/local";
// import PicGoImageHosting from "./imagehosting/picgo";
// import SMMSHosting from "./imagehosting/smms";
import md5 from "blueimp-md5";

let nodeIndex = 0;
const now = Date.now();
export function createNodeTempID() {
    return `${now}${++nodeIndex}`
}

export function buildDocsNodes(docs: IDocsDataItem[], parentNode: IDocsNodeBase, provider: IDocsCreateDAO) {
    const nodes: IDocsNodeBase[] = [];
    docs.forEach((doc) => {
        const node = DocsNode.getNode({
            parentNode: parentNode,
            nodeType: doc.type,
            deprecated: doc.deprecated,
            data: {
                title: doc.title,
                content: doc.content,
                cover: doc.cover,
                extension: doc.extension,
                isConfig: doc.isConfig,
                hasChildren: !!doc.hasChildren
            },
            dao: provider.createDAO({
                type: doc.type,
                parentNode: parentNode,
                id: doc.id,
                isConfig: doc.isConfig
            })
        })
        nodes.push(node)
    })
    return nodes;
}

export function nodeTraversal(root: IDocsNodeBase, fn: (node: IDocsNodeBase) => void) {
    const children = root.children;
    if (children && children.length) {
        for (let i = 0, ci;
            (ci = children[i]);) {
            nodeTraversal(ci, fn);
            //ci被替换的情况，这里就不再走 fn了
            if (ci.parentNode) {
                if (ci.children && ci.children.length) {
                    fn(ci);
                }
                // if (ci.parentNode) i++;
            }
            i++;
        }
    } else {
        fn(root);
    }
}

export function nodePath(node: IDocsNodeBase) {
    const path: IDocsNodeBase[] = [];
    path.push(node);
    let parent = node.parentNode;
    while (parent && parent.parentNode) {
        path.push(parent);
        parent = parent.parentNode;
    }
    return path.reverse();
}

export async function createDocsData(repo: PlatformParams, image?: PlatformParams) {
    let data: IDocsData | undefined;
    const imageHosting = image ? createDocsImageHosting(image) : undefined;
    if (repo.platform === EPlatformType.EPlatformTypeBuiltin) {
        data = new BuiltinData({ token: repo.token})
        await data.init()
    }
    else if (repo.platform === EPlatformType.EPlatformTypeBrowser) {
        data = new BrowserData({ token: repo.token, imageHosting})
        data.init()
    }
    else if (repo.platform === EPlatformType.EPlatformTypeLocal) {
        data = new LocalData({rootPath: repo.repo, imageHosting})
        data.init()
    }
    else if (repo.platform === EPlatformType.EPlatformTypeFSA) {
        try {
            const docRepoObj: PlatformFSARepoObj = JSON.parse(repo.repo);
            data = new FSAData({repo: docRepoObj, imageHosting})
        } catch (error) {
            console.log(error)
        }
        
    }
    else if (repo.platform === EPlatformType.EPlatformTypeGithub) {
        try {
            const docRepoObj: PlatformGithubRepoObj = JSON.parse(repo.repo);
            data = new GithubData({ repo: docRepoObj, imageHosting });
            data.init()
        } catch (error) {
            console.log(error)
        }
    } else if (repo.platform === EPlatformType.EPlatformTypeGitee) {
        try {
            const docRepoObj: PlatformGiteeRepoObj = JSON.parse(repo.repo);
            data = new GiteeData({ repo: docRepoObj, imageHosting});
            data.init()
        } catch (error) {
            console.log(error)
        }
    } else if (repo.platform === EPlatformType.EPlatformTypeGitlab) {
        try {
            const docRepoObj: PlatformGitlabRepoObj = JSON.parse(repo.repo);
            data = new GitlabData({ repo: docRepoObj, imageHosting });
            data.init()
        } catch (error) {
            console.log(error)
        }
    }
    return data;
}

export function createDocsImageHosting(repo: PlatformParams) {
    let hosting: IDocsImageHosting | undefined;
    if (repo.platform === EPlatformType.EPlatformTypeGithub) {
        try {
            const imageRepoObj: PlatformGithubRepoObj = JSON.parse(repo.repo);
            hosting = new GithubImageHosting({ repo: imageRepoObj });
        } catch (error) {
            console.log(error)
        }
    } else if (repo.platform === EPlatformType.EPlatformTypeGitee) {
        try {
            const imageRepoObj: PlatformGiteeRepoObj = JSON.parse(repo.repo);
            hosting = new GitheeImageHosting({ repo: imageRepoObj });
        } catch (error) {
            console.log(error)
        }
    } else if (repo.platform === EPlatformType.EPlatformTypeGitlab) {
        try {
            const imageRepoObj: PlatformGitlabRepoObj = JSON.parse(repo.repo);
            hosting = new GitlabImageHosting({ repo: imageRepoObj });
        } catch (error) {
            console.log(error)
        }
    } else if (repo.platform === EPlatformType.EPlatformTypeLocal) {
        hosting = new LocalImageHosting({rootPath: repo.repo})
    } /*else if (repo.platform === EPlatformType.EPlatformTypePicGo) {
        hosting = new PicGoImageHosting({url: repo.repo})
    } else if(repo.platform === EPlatformType.EPlatformTypeSMMS) {
        hosting = new SMMSHosting({token: repo.token})
    }*/
    return hosting;
}

export async function createRepos(info: IDocsProviderSettingInfo) {


    const data = await createDocsData(info.doc_repo, info.image_repo);

    if(!data) {
        return;
    }

    // if(doc_repo?.platform === EPlatformType.EPlatformTypeFSA) {
    //     const result = await doc_repo.init();
    //     if(result.status !== EInitResultStatus.EInitResultStatusSuccess) {
    //         return;
    //     }
    // }

    return {
        data,
        id: info.id,
        title: info.title,
        providerID: data.uniqueID
    }

}