import { FolderFilled, ForkOutlined, GithubFilled, GitlabFilled } from "@ant-design/icons"
import { EDocsProviderType } from "../types/docs.d"

export const GiteeIcon = <svg viewBox="0 0 1024 1024" width="12" height="12"><path fill="currentColor" d="M967.736264 416.351648H450.10989v0.011253A45.010989 45.010989 0 0 0 405.098901 461.362637l-0.045011 112.527473a45.010989 45.010989 0 0 0 45.010989 45.022242L765.186813 618.901099a45.010989 45.010989 0 0 1 45.010989 45.010989v22.505494c0 74.571956-60.461011 135.032967-135.032967 135.032967H247.526681a45.010989 45.010989 0 0 1-45.010989-45.010989V348.835165h-0.011252c0-74.571956 60.449758-135.032967 135.032967-135.032967h630.075077v-0.022506a45.010989 45.010989 0 0 0 45.010989-44.988483l0.101274-112.527473H1012.747253a45.010989 45.010989 0 0 0-45.010989-45.033494L337.582418 11.252747C151.146901 11.252747 0 162.399648 0 348.835165v630.153846a45.010989 45.010989 0 0 0 45.010989 45.010989h663.912088c167.800967 0 303.824176-136.023209 303.824176-303.824176V461.362637a45.010989 45.010989 0 0 0-45.010989-45.010989z" p-id="2980"></path></svg>
export const LocalIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6632" width="15" height="15"><path d="M816.384 742.4a35.072 35.072 0 0 1-12.8 23.04 38.656 38.656 0 0 1-25.6 9.472H246.272a38.656 38.656 0 0 1-25.6-9.472 35.072 35.072 0 0 1-12.8-23.04l-16.128-96.512A35.584 35.584 0 0 1 199.936 614.4 38.912 38.912 0 0 1 230.4 599.552h563.2a38.912 38.912 0 0 1 30.72 13.568 35.584 35.584 0 0 1 8.448 31.744z m92.416-190.72L769.28 204.8a67.84 67.84 0 0 0-62.464-41.984H317.184A67.84 67.84 0 0 0 254.72 204.8L115.456 550.912A185.088 185.088 0 0 0 102.4 600.064a190.72 190.72 0 0 0 1.792 51.2l25.6 153.6A67.328 67.328 0 0 0 153.6 844.8a64.768 64.768 0 0 0 43.52 16.128h629.504A64.768 64.768 0 0 0 870.4 844.8a67.328 67.328 0 0 0 23.04-40.192l25.6-153.6a190.72 190.72 0 0 0 1.792-51.2 185.088 185.088 0 0 0-12.288-48.896z" fill="currentColor" p-id="6633"></path></svg>
// export const BrowserIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12094" width="16" height="16"><path fill="currentColor" d="M832 1024 192 1024c-106.048 0-192-85.952-192-192L0 192c0-106.048 85.952-192 192-192l640 0c105.984 0 192 85.952 192 192l0 640C1024 938.048 937.984 1024 832 1024zM192 64C156.672 64 128 92.672 128 128s28.672 64 64 64 64-28.672 64-64S227.328 64 192 64zM896 256 128 256l0 576c0 35.392 28.672 64 64 64l640 0c35.392 0 64-28.608 64-64L896 256z" p-id="12095"></path></svg>



export function getProviderTypeIcon(type: EDocsProviderType) {
    if (type === EDocsProviderType.EDocsProviderTypeGitHub) {
        return <GithubFilled />
    } else if (type === EDocsProviderType.EDocsProviderTypeGitLab) {
        return <GitlabFilled />
    } else if (type === EDocsProviderType.EDocsProviderTypeGitee) {
        return <span className="icon">{GiteeIcon}</span>
    } else if (type === EDocsProviderType.EDocsProviderTypeLocal || type === EDocsProviderType.EDocsProviderTypeFSA) {
        // return LocalIcon
        return <FolderFilled />
    } /*else if(type === EDocsProviderType.EDocsProviderTypeBrowser) {
        return BrowserIcon
    }*/

    return <ForkOutlined />
}