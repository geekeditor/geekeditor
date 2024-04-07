import { get, put, del } from '../utils/http'


const BASET_HOST = 'https://api.github.com'
const GITHUB = {
    checkRepos(token: string, visibility?: string) {
        return get(`${BASET_HOST}/user/repos`, { page: 1, per_page: 200, visibility: visibility || 'all' }, { authorization: `token ${token}` })
    },

    get(url: string, token: string) {
        return get(url, {}, { authorization: `token ${token}` })
    },

    put(url: string, token: string, params: any, onUploadProgress?: (progressEvent: any) => void) {
        return put(url, params, { authorization: `token ${token}` }, onUploadProgress ? { onUploadProgress } : {})
    },

    del(url: string, token: string, params: any) {
        return del(url, params, { authorization: `token ${token}` })
    }
}
export default GITHUB;