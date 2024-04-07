import { createStore, applyMiddleware } from 'redux'
import { Store } from "redux";
import thunk from 'redux-thunk'
import { IDocsNodeStore, IDocsNodeState, IDocsSaver, IDocsNodeData } from '../../types/docs.d';

const ACTION_SET = "ACTION_SET";

const contentState: IDocsNodeState = {
    content: '',
    title: '',
    cover: '',
    extension: '',
    changed: false
}

function reducer(state = contentState, action: {
    type: string; payload: {
        content?: string;
        title?: string;
        extension?: string;
        cover?: string;
    }
}) {

    switch (action.type) {
        case ACTION_SET:
            return { ...state, ...action.payload }
        default:
            return state
    }
}

export class DocsNodeStore implements IDocsNodeStore {
    private _store: Store<IDocsNodeState>;
    private _saver: IDocsSaver | undefined;
    constructor(options?: { data?: IDocsNodeData; saver?: IDocsSaver }) {
        options = options || {}
        const initState = { ...contentState, ...options.data };
        this._store = createStore(reducer, initState, applyMiddleware(thunk));
        this._saver = options.saver;
    }
    setContent(content: string) {
        this._store.dispatch({ type: ACTION_SET, payload: { content } });
    }
    getContent() {
        return this._store.getState().content;
    }
    setTitle(title: string) {
        this._store.dispatch({ type: ACTION_SET, payload: { title } });
    }
    getTitle() {
        return this._store.getState().title;
    }
    setExtension(extension: string) {
        this._store.dispatch({ type: ACTION_SET, payload: { extension } });
    }
    getExtension() {
        return this._store.getState().extension;
    }
    saved() {
        return false;
    }
    setSaver(saver: IDocsSaver) {
        this._saver = saver;
    }
    save() {
        if (this._saver) {
            return this._saver.save();
        }

        return Promise.resolve(false);
    }
    subscribe(listener: () => void) {
        return this._store.subscribe(listener);
    }
};