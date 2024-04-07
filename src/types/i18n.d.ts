/**
 * Represent item of the I18nDictionary config
 */
export interface Dictionary {
    /**
     * The keys of the object can represent two entities:
     *  1. Dictionary key usually is an original string from default locale, like "Convert to"
     *  2. Sub-namespace section, like "toolbar.converter.<...>"
     *
     *  Example of 1:
     *  toolbox: {
     *    "Add": "Добавить",
     *  }
     *
     *  Example of 2:
     *  ui: {
     *    toolbar: {
     *      toolbox: {    <-- Example of 1
     *        "Add": "Добавить"
     *      }
     *    }
     *  }
     */
    [key: string]: DictValue;
}

/**
 * The value of the dictionary can be:
 *  - other dictionary
 *  - result translate string
 */
export type DictValue = { [key: string]: Dictionary | string } | string;