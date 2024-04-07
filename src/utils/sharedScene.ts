import DocsNode from "../docs/docsprovider/DocsNode";
import factory from "../docs/docsprovider/DocsProviderFactory";
import { EDocsNodeType, EDocsProviderType, IDocsCreateDAO, IDocsNodeBase } from "../types/docs.d";
import { IWinTab } from "../types/win";
import sharedFSAHandleCache from "./sharedFSAHandleCache";
import sharedPreferences from "./sharedPreferences";
import sharedPreferencesKeys from "./sharedPreferencesKeys";

type NodeScene = {
    pid: string;
    id?: string;
    title: string;
}

class SharedScene {
    saveTabsScene(tabs: IWinTab[], activeTabID: number) {
        let activeIndex = 0;
        const tabsJson = tabs.filter((tab) => tab.node.providerType !== EDocsProviderType.EDocsProviderTypeFSA && !tab.node.isConfig && !tab.node.isRemoved).map((tab, index) => {
            if (tab.id === activeTabID) {
                activeIndex = index
            }

            return {
                pid: tab.node.providerID,
                id: tab.node.id,
                title: tab.node.title
            }
        })

        sharedPreferences.set(sharedPreferencesKeys.kTabsScene, { tabs: tabsJson, index: activeIndex });
    }

    getTabsScene() {
        return new Promise<{ tabs: { pid: string; id: string; title: string }[]; index: number }>((resolve) => {
            sharedPreferences.ready(() => {
                resolve(sharedPreferences.get(sharedPreferencesKeys.kTabsScene))
            })
        })
    }

    setProviderScene(node: IDocsNodeBase) {

        sharedPreferences.ready(async () => {
            const providerID = node.providerID;
            const providerType = node.providerType;
            const scenes: { [key: string]: NodeScene } = sharedPreferences.get(sharedPreferencesKeys.kProvidersScene) || {};
            if (node.isRoot) {
                delete scenes[providerID]
            } else {
                
                if(providerType === EDocsProviderType.EDocsProviderTypeFSA) {

                    const hanldeId = `${providerID}_${node.id}`
                    const handle = await sharedFSAHandleCache.get(hanldeId)
                    if(handle) {
                        await sharedFSAHandleCache.set(hanldeId, handle, true);
                        scenes[providerID] = {
                            pid: providerID,
                            id: node.id,
                            title: node.title
                        }
                    }

                } else {
                    scenes[providerID] = {
                        pid: providerID,
                        id: node.id,
                        title: node.title
                    }
                }
            }
            sharedPreferences.set(sharedPreferencesKeys.kProvidersScene, scenes);
           
        })

        

    }

    getProviderScene(providerID: string):Promise<IDocsNodeBase|undefined> {

        return new Promise((resolve)=>{
            sharedPreferences.ready(() => {
                const scenes: { [key: string]: NodeScene } = sharedPreferences.get(sharedPreferencesKeys.kProvidersScene) || {};
                const nodeScene = scenes[providerID];
                if (nodeScene) {
                    const provider = factory.children.find((provider) => provider.providerID === nodeScene.pid) as IDocsCreateDAO;
                    if (provider) {
    
    
                        const dao = provider.createDAO({
                            type: EDocsNodeType.EDocsNodeTypeDir,
                            id: nodeScene.id
                        })
    
    
                        const node = DocsNode.getNode({
                            nodeType: EDocsNodeType.EDocsNodeTypeDir,
                            dao,
                            data: {
                                title: nodeScene.title
                            }
                        }, true)

                        resolve(node);
    
                    }
                }

                resolve(undefined)
    
            })
        })

    }

    setProviderCacheIndexScene(providerID: string, cacheIndexes: any) {

        sharedPreferences.ready(async () => {
            const scenes: { [key: string]: any } = sharedPreferences.get(sharedPreferencesKeys.kProviderCacheIndexScene) || {};
            scenes[providerID] = cacheIndexes;
            sharedPreferences.set(sharedPreferencesKeys.kProviderCacheIndexScene, scenes);
           
        })

        

    }

    getProviderCacheIndexScene(providerID: string):Promise<any|undefined> {

        return new Promise((resolve)=>{
            sharedPreferences.ready(() => {
                const scenes: { [key: string]: NodeScene } = sharedPreferences.get(sharedPreferencesKeys.kProviderCacheIndexScene) || {};
                const scene = scenes[providerID];
                resolve(scene)
            })
        })

    }
}

const sharedScene = new SharedScene();
export default sharedScene;