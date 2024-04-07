// glpat-Fkn2eTrBiScuBRRFXcsr
// https://docs.gitlab.com/ee/api/repository_files.html
// https://docs.gitlab.com/ee/api/users.html

// https://gitlab.com/montisan/images/-/raw/main/WechatIMG232.jpeg?inline=false
// https://gitlab.com/api/v4/projects/35809068/repository/blobs/fcc75af174fd737c4d7c501ee6eb5f81fc753fa5/raw

import { get, put, del, post } from '../utils/http'
import {addUrlArgs} from '../utils/utils'


export const BASET_HOST = 'https://gitlab.com/api/v4'
const GITLAB = {
    checkRepos(token: string, visibility?: string) {
        return get(`${BASET_HOST}/projects`, { owned: true, visibility: visibility}, { authorization: `bearer ${token}` })
    },

    get(url: string, token: string) {
        return get(url, {}, { authorization: `bearer ${token}` })
    },

    put(url: string, token: string, params: any, update?: boolean, onUploadProgress?: (progressEvent: any) => void) {
        return update ? put(url, {...params}, { authorization: `bearer ${token}` }, onUploadProgress ? { onUploadProgress } : {}) : post(url, {...params}, { authorization: `bearer ${token}` }, onUploadProgress ? { onUploadProgress } : {})
    },

    del(url: string, token: string, params: any) {
        return del(addUrlArgs(url, {}), {...params}, { authorization: `bearer ${token}` })
    }
}

export default GITLAB;