import { Dictionary } from "../types/i18n";


export default class I18N {

    private static _langs: { [key: string]: Dictionary } = {};
    private static _localLang = (navigator.language || 'zh-cn').toLowerCase();
    static register(lang: string, dictionary: Dictionary) {
        this._langs[lang] = dictionary;
    }

    static get currentDictionary() {
        return this._langs[this._localLang] || this._langs[Object.keys(this._langs)[0] || '']
    }

    static getLang(path: string) {
        const dictionary = this.currentDictionary;
        if (!dictionary) {
            throw Error("not import language file");
        }
        const paths = (path || "").split(".");
        let lang: any = dictionary;
        for (let i = 0, ci: string;
            (ci = paths[i++]);) {
            if (typeof lang === 'string') {
                break;
            }
            lang = lang[ci];
            if (!lang) break;
        }
        return lang;
    }

}