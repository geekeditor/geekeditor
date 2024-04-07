import BuiltinData from '../docs/docsprovider/data/builtin';
import i18n from '../i18n';
import { EPlatformType } from '../types/platform.d';
import { decrypt, encrypt, getCanvasFingerprint } from './encrypt';
import CustomEventEmitter from './eventemitter';
import sharedPreferencesKeys from './sharedPreferencesKeys';
import Storage from './storage'

const lastVersion = 'v2'
const currentVersion = 'v3'

async function getDefaultTabsSence() {
    const builtin = new BuiltinData({token: ''})
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve({ tabs: [{pid: builtin.uniqueID, id: 1, title: i18n.t("repo.guide") }], index: 0 })
        }, 0)
    })
}


class SharedPreferences extends CustomEventEmitter {
    private _storage!: Storage;
    private _sharedPreferences!: { [key: string]: any };
    private _sharedPreferencesCurVersion!: string;
    private _isReady!: boolean;
    private _settings!: { [key: string]: any };
    private _settingsKey!: string;
    private _fingerprint!: string;
    constructor() {

        super()

        const sharedPreferencesLastVersion = `__shared_preferences_${lastVersion}__`;
        this._sharedPreferencesCurVersion = `__shared_preferences_${currentVersion}__`;
        this._settingsKey = `__settings__`;
        this._settings = {};
        this._sharedPreferences = {}
        this._storage = new Storage();
        this._fingerprint = getCanvasFingerprint();
        this._storage.get(this._sharedPreferencesCurVersion).then(async (value) => {


            try {
                if (value) {
                    value = decrypt(value, this._fingerprint)
                }
                value = JSON.parse(value)
            } catch (error) {

                value = {}
                let last = await this._storage.get(sharedPreferencesLastVersion);
                try {
                    value = JSON.parse(last)
                    // if(last[sharedPreferencesKeys.kTypesets]) {
                    //     value[sharedPreferencesKeys.kTypesets] = JSON.parse(JSON.stringify(last[sharedPreferencesKeys.kTypesets]))

                    // }
                    if(value[this._settingsKey]) {
                        value[this._settingsKey][sharedPreferencesKeys.kSettingsDocProviders] = []

                    }
                    // this._storage.set(sharedPreferencesLastVersion, "", 5);
                } catch (error) {

                }
                
                value[sharedPreferencesKeys.kTabsScene] = await getDefaultTabsSence()

            }

            const sharedPreferences = value || {}
            const settings = sharedPreferences[this._settingsKey] || {}

            this._settings = { ...settings, ...this._settings };
            this._sharedPreferences = { ...sharedPreferences, ...this._sharedPreferences };
            this._sharedPreferences[this._settingsKey] = this._settings;
            this._isReady = true;

            this.trigger('__ready__');
        })
    }

    private syncToStorage(): Promise<boolean> {
        return new Promise((resolve) => {
            this._storage.set(this._sharedPreferencesCurVersion, encrypt(JSON.stringify(this._sharedPreferences), this._fingerprint))
            resolve(true);
        });
    }

    isReady() {
        return this._isReady;
    }

    ready(callback: Function) {
        if (this._isReady) {
            callback()
        } else {
            this.on('__ready__', callback)
        }
    }

    setSetting(key: string, setting: any) {
        if (!!!key) {
            return false;
        }

        this._settings[key] = setting;
        this.syncToStorage().then(() => {
            this.trigger(key, setting);
        });
        return true;
    }

    getSetting(key: string) {
        return this._settings[key];
    }

    set(key: string, value: any) {
        if (this._settingsKey === key) {
            return false;
        }

        this._sharedPreferences[key] = value;
        this.syncToStorage().then(() => {
            this.trigger(key, value);
        })
        return true;
    }

    get(key: string) {
        return this._sharedPreferences[key];
    }

    import(config: string) {

        let value: any = {}
        try {
            value = JSON.parse(config)

            console.log(value)

            const lastProviders = this._sharedPreferences[this._settingsKey][sharedPreferencesKeys.kSettingsDocProviders] || [];
            const localProviders = lastProviders.filter((p: any) => (p.doc_repo.platform === EPlatformType.EPlatformTypeFSA || p.doc_repo.platform === EPlatformType.EPlatformTypeLocal))

            if (value[this._settingsKey]) {
                const providers = value[this._settingsKey][sharedPreferencesKeys.kSettingsDocProviders]
                const gitProviders = providers.filter((p: any) => (p.doc_repo.platform !== EPlatformType.EPlatformTypeFSA && p.doc_repo.platform !== EPlatformType.EPlatformTypeLocal))
                value[this._settingsKey][sharedPreferencesKeys.kSettingsDocProviders] = gitProviders;
            }

            const settings = value[this._settingsKey] || {}
            const providers = value[this._settingsKey][sharedPreferencesKeys.kSettingsDocProviders] || []

            settings[sharedPreferencesKeys.kSettingsDocProviders] = [...localProviders, ...providers]
            value[this._settingsKey]= settings;

            this._sharedPreferences = value;
        } catch (error) {

        }

        return this.syncToStorage()
    }

    backup(): Promise<string> {
        return new Promise((resolve) => {
            this.ready(() => {
                resolve(JSON.stringify(this._sharedPreferences));
            })
        })
    }

    clear() {
        this._sharedPreferences = {}

        return this.syncToStorage()
    }
}

const sharedPreferences = new SharedPreferences();
export default sharedPreferences;