import CustomEventEmitter from "../utils/eventemitter";

export default class MonacoBridge extends CustomEventEmitter {
    private _options!: {getValue: ()=>string; setValue: (value: string)=>void;};
    constructor(options: {getValue: ()=>string; setValue: (value: string)=>void;}) {
        super()
        this._options = options;
    }

    setContent(content: string) {
        return this._options.setValue(content);
    }

    getContent() {
        return this._options.getValue()
    }
}