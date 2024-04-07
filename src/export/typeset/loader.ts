
import { getTheme, postThemeList } from '../../api/app';
import i18n from '../../i18n';
import { decrypt } from '../../utils/encrypt';
import sharedPreferences from '../../utils/sharedPreferences'
import sharedPreferencesKeys from '../../utils/sharedPreferencesKeys';
import { TypesetData } from './type';

export class CustomLocalTypesets {
    static async loadTypesets() {
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        return typesets;
    }

    static saveTypeset(typeset: TypesetData) {
        if (!typeset.id) {
            typeset.id = `typeset-${Date.now()}`;
        }
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        const index = typesets.findIndex((t) => t.id === typeset.id);
        if (index !== -1) {
            typesets[index] = typeset;
        } else {
            typesets.push(typeset);
        }
        sharedPreferences.set(sharedPreferencesKeys.kTypesets, typesets);
        return true;
    }

    static deleteTypeset(typeset: TypesetData) {
        if (!typeset.id) {
            return false;
        }
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        const index = typesets.findIndex((t) => t.id === typeset.id);
        if (index !== -1) {
            typesets.splice(index, 1);
        }
        sharedPreferences.set(sharedPreferencesKeys.kTypesets, typesets);
        return true;
    }
}

export class CustomCloudTypesets {
    static async loadTypesets() {
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        return typesets;
    }

    static saveTypeset(typeset: TypesetData) {
        if (!typeset.id) {
            typeset.id = `typeset-cloud-${Date.now()}`;
        }
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        const index = typesets.findIndex((t) => t.id === typeset.id);
        if (index !== -1) {
            typesets[index] = typeset;
        } else {
            typesets.push(typeset);
        }
        sharedPreferences.set(sharedPreferencesKeys.kTypesets, typesets);
        return true;
    }

    static deleteTypeset(typeset: TypesetData) {
        if (!typeset.id) {
            return false;
        }
        const typesets: TypesetData[] = sharedPreferences.get(sharedPreferencesKeys.kTypesets) || []
        const index = typesets.findIndex((t) => t.id === typeset.id);
        if (index !== -1) {
            typesets.splice(index, 1);
        }
        sharedPreferences.set(sharedPreferencesKeys.kTypesets, typesets);
        return true;
    }
}

export class RecommendTypesets {
    static typesets: TypesetData[];
    static get builtinDefaultTypeset() {
        let defaultCSS = require('./themes/default.text.less');
        return {
            id: 'default',
            css: defaultCSS,
            title: i18n.t("common.default")
        };
    }

    static async loadTypesets() {

        if (!this.typesets) {
            // const result = await postThemeList({ pageSize: 100, pageIndex: 1, example: {on: 1} })
            // let typesets: TypesetData[] = (result.list || []).map((it) => {
            //     return {
            //         id: it.id,
            //         title: it.title || '',
            //         css: it.css,
            //         cover: it.cover
            //     }
            // })
            this.typesets = [];
            // this.typesets = [...(await import('./themes')).default]
            this.typesets.unshift(this.builtinDefaultTypeset)
        }

        return this.typesets;
    }

    static async loadTypeset(typesetId: string | number) {
        return getTheme(typesetId).then((val) => {
            if (val) {
                return decrypt(val.css || '', 'gk_css_encrypt')
            }

            return null
        })
    }
}