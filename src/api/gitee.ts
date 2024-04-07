// 6ebe5211394d6b92fb97140865950ff1


import { get, put, del, post } from '../utils/http'
import {addUrlArgs} from '../utils/utils'


export const BASET_HOST = 'https://gitee.com/api/v5'
const GITEE = {
    checkRepos(token: string, visibility?: string) {
        return get(`${BASET_HOST}/user/repos`, { page: 1, per_page: 100, visibility: visibility || 'all', access_token: token }, { authorization: `token ${token}` })
    },

    get(url: string, token: string) {
        return get(url, {access_token: token}, { authorization: `token ${token}` })
    },

    put(url: string, token: string, params: any, onUploadProgress?: (progressEvent: any) => void) {
        return params.sha ? put(url, {...params, access_token: token}, { authorization: `token ${token}` }, onUploadProgress ? { onUploadProgress } : {}) : post(url, {...params, access_token: token}, { authorization: `token ${token}` }, onUploadProgress ? { onUploadProgress } : {})
    },

    del(url: string, token: string, params: any) {
        return del(addUrlArgs(url, {access_token: token}), {...params}, { authorization: `token ${token}` })
    }
}
export default GITEE;