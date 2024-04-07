import { IWin, IWinAction, IWinStoreAction, IWinTab } from '../types/win';
import { Store } from 'redux';
import createWinStore from '../app/window/store';
import { createWinID } from '../app/window/utils';


export const ACTION_TYPE_WIN_ADD = "ACTION_TYPE_WIN_ADD"
export const ACTION_TYPE_WIN_REMOVE = "ACTION_TYPE_WIN_REMOVE"
export const ACTION_TYPE_WIN_CONCAT = "ACTION_TYPE_WIN_CONCAT"

export const ACTION_WIN_ADD = (tabs: IWinTab[], activeTabID: number, floating: boolean) => {
    const store: Store<IWin, IWinAction> = createWinStore({ tabs, activeTabID, floating, id: createWinID() });
    return {
        type: ACTION_TYPE_WIN_ADD,
        payload: {
            add: store
        }
    }
}

const windowState: {
    stores: Store<IWin, IWinAction>[];
} = {
    stores: [],
}

export default function win(state = windowState, action: IWinStoreAction) {

    switch (action.type) {
        case ACTION_TYPE_WIN_ADD:
            state.stores.push(action.payload.add);
            return { stores: [...state.stores] };
        case ACTION_TYPE_WIN_REMOVE:
            {
                const index = state.stores.findIndex((store) => store === action.payload.del);
                if (index !== -1) {
                    state.stores.splice(index, 1);
                }
            }
            return { ...state }
        case ACTION_TYPE_WIN_CONCAT:
            const dest = action.payload.dest;
            if (dest) {

            }
            return state;
        default:
            return state;
    }

}