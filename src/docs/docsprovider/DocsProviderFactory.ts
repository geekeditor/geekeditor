import DocsProviderSerialization from './DocsProviderSerialization'
import { IDocsNodeOptions, IDocsProvider, EDocsProviderType, IDocsNodeBase, EDocsNodeChangeType, IDocsProviderSettingInfo, IDocsData, IDocsImageHosting, IDocsCreateDAO, EDocsNodeType } from '../../types/docs.d';
import DocsProviderMemory from './DocsProviderMemory'
import { nodeTraversal, createDocsImageHosting, createDocsData, createRepos } from './utils'
import sharedPreferences from "../../utils/sharedPreferences"
import { EPlatformType, PlatformGithubRepoObj, PlatformParams } from '../../types/platform.d';
import { isLocal } from '../../api/local';
import CustomEventEmitter from '../../utils/eventemitter';
import sharedPreferencesKeys from '../../utils/sharedPreferencesKeys';


class DocsProviderFactory extends DocsProviderMemory {
    // private _providers!: IDocsProvider[];
    private local!: IDocsProvider;
    private _dataMap: Map<string, string> = new Map();
    private _datas: IDocsData[] = [];
    private _eventBus: CustomEventEmitter = new CustomEventEmitter();
    private _isReady: boolean = false;
    constructor(options?: any) {
        super(options);
        this._isLoaded = false;
        // this._providers = [];
        // this.local = new DocsProviderSerialization({ parentNode: this, title: '本地文档', type: EDocsProviderType.EDocsProviderTypeLocal, data: new BrowserData() });
        // this.loadProviders();
        sharedPreferences.on(['doc_providers', 'hide_builtin_provider'], () => {
            this.loadProviders();
        });
        sharedPreferences.ready(() => {
            this.loadProviders();
            this.expand(isLocal() ? EDocsProviderType.EDocsProviderTypeLocal : EDocsProviderType.EDocsProviderTypeBrowser)
        })
    }

    get title() {
        return ''
    }


    get children() {
        return this._children;
    }

    get parentNode() {
        return undefined;
    }

    get selectedProvider() {
        const selected = sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsSelectedProvider) || '';
        return !!this._children.find((p)=>p.providerID===selected) ? selected : (this._children.length ? this._children[0].providerID : "")
    }

    set selectedProvider(selected: string) {
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsSelectedProvider, selected);
    }

    getSelectedProvider() {
        const selected = this.selectedProvider;
        return this._children.find((p)=>p.providerID===selected)
    }

    expand(type?: EDocsProviderType) {
        const roots = type !== undefined ? this.getProviders(type) : [this as any];
        roots.forEach((root) => {
            nodeTraversal(root, (node: IDocsNodeBase) => {
                node.trigger('expand', true);
            })
        })

    }

    collapse(type?: EDocsProviderType) {
        const roots = type !== undefined ? this.getProviders(type) : [this as any];
        roots.forEach((root) => {
            nodeTraversal(root, (node: IDocsNodeBase) => {
                node.trigger('expand', false);
            })
        })
    }

    getProviders(type: EDocsProviderType) {
        const providers = this._children.filter((provider) => provider.providerType === type);
        return providers;
    }

    getProvider(id: string) {
        return this._children.find((p)=>p.providerID===id)
    }

    ready(callback: Function) {
        if(this._isReady) {
            callback()
        } else {
            this._eventBus.on('ready', callback);
        }
    }

    loadAsset(providerId: string, docId: string, assetName: string) {

        const data = this._datas.find((data)=>data.uniqueID===providerId);
        if(data) {
            return data.loadAsset(docId, assetName).then((result)=>{

                if(result) {
                    return result.file;
                }

                return Promise.reject();

            })
        }

        return Promise.reject()

    }

    findDocument(providerId: string, docId: string) {
        const data = this._datas.find((data)=>data.uniqueID===providerId);
        if(data) {
            return data.find(docId)
        }

        return Promise.resolve(undefined)
    }

    private async loadProviders() {

        // this.providers = [this.local];
        const providers: IDocsProvider[] = [];
        const infos: IDocsProviderSettingInfo[] = [];
        // const hideBuiltinProvider = !!sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsHideBuiltinProvider)
        // if (!hideBuiltinProvider) {
        //     infos.push(this.builtinProvider);
        // }
        infos.push(...(sharedPreferences.getSetting('doc_providers') || []))
        infos.push(this.builtinProvider);
        const repos: {
            data: IDocsData;
            id: string;
            title: string;
            providerID: string;
        }[] = [];

        await infos.reduce(
            (promise, info) => promise.then(async () => {
                try {
                    const repo = await createRepos(info);

                    if(repo) {
                        repos.push(repo)
                    }
                } catch (e) {
                }
            }),
            Promise.resolve()
        )

        for (const info of repos) {

            if(!info) {
                continue;
            }

            let type: EDocsProviderType | undefined;
            if (info.data.platform === EPlatformType.EPlatformTypeGithub) {
                type = EDocsProviderType.EDocsProviderTypeGitHub
            } else if (info.data.platform === EPlatformType.EPlatformTypeBrowser || info.data.platform === EPlatformType.EPlatformTypeBuiltin) {
                type = EDocsProviderType.EDocsProviderTypeBrowser
            } else if (info.data.platform === EPlatformType.EPlatformTypeLocal) {
                type = EDocsProviderType.EDocsProviderTypeLocal
            } else if (info.data.platform === EPlatformType.EPlatformTypeFSA) {
                type = EDocsProviderType.EDocsProviderTypeFSA
            } else if (info.data.platform === EPlatformType.EPlatformTypeGitee) {
                type = EDocsProviderType.EDocsProviderTypeGitee
            } else if (info.data.platform === EPlatformType.EPlatformTypeGitlab) {
                type = EDocsProviderType.EDocsProviderTypeGitLab
            }

            if (type !== undefined) {

                const existProviderIndex = this._children.findIndex((p)=>p.providerID===info.providerID);
                
                const provider:any = existProviderIndex !== -1 ? this._children[existProviderIndex] : new DocsProviderSerialization({ id: info.data.rootID, providerID: info.providerID, title: info.data.title, type, data: info.data, parentNode: this as any })
                providers.push(provider);
                this._dataMap.set(provider.providerID, info.id);


                if(existProviderIndex !== -1) {
                    this._children.splice(existProviderIndex, 1);
                }

                
            }
        }

        this._datas = repos.map((repo)=>repo.data)

        

        this._children.forEach((provider) => {
            nodeTraversal(provider, (node) => {
                const n = node as IDocsNodeBase;
                n.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeRemoved)
            })
        })

        this._children = providers.sort((a: IDocsProvider, b: IDocsProvider) => {

            if(a.providerType === EDocsProviderType.EDocsProviderTypeBrowser) {
                return 1;
            } else if(b.providerType === EDocsProviderType.EDocsProviderTypeBrowser) {
                return -1;
            }

            return a.providerType - b.providerType;
        })

        this._isLoaded = true;
        this.notifyChangedHandlers(EDocsNodeChangeType.EDocsNodeChangeTypeChildren);

        if(!this._isReady) {
            this._isReady = true;
            this._eventBus.trigger('ready');
            this._eventBus.offAll('ready');
        }
        
    }

    private get builtinProvider(): IDocsProviderSettingInfo {
        return {
            id: 'builtin',
            doc_repo: {
                platform: EPlatformType.EPlatformTypeBuiltin,
                token: 'builtin',
                repo: '',
            },
            title: '',
            image_repo: {
                platform: EPlatformType.EPlatformTypeGithub,
                token: '',
                repo: ''
            }

        }
    }

    removeChild(provider: IDocsProvider): Promise<boolean> {

        const dataId = this._dataMap.get(provider.providerID);
        if (dataId === 'builtin') {
            sharedPreferences.setSetting('hide_builtin_provider', true);
        } else {
            const providers: IDocsProviderSettingInfo[] = sharedPreferences.getSetting('doc_providers') || []
            providers.forEach((p, index) => {
                if (p.id === dataId) {
                    providers.splice(index, 1);
                }
            })
            sharedPreferences.setSetting('doc_providers', providers);
        }

        return Promise.resolve(true);
    }

}

const factory = new DocsProviderFactory();

export default factory;