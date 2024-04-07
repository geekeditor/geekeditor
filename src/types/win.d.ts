import { Action } from "redux";
import { IDocsNodeBase } from "./docs";

export enum EWinTabType {
    WinTabHome = 1,
    WinTabDoc = 2
}

export interface IWin {
    id: number;
    activeTabID:number;
    tabs: IWinTab[];
    floating: boolean;
}

export interface IWinTab {
    id: number;
    type: EWinTabType;
    floatable: boolean;
    removable: boolean;
    node: IDocsNodeBase
}

export interface IWinAction extends Action<string> {
    payload: {
        tab?: IWinTab;
        tabID: number;
        toTabID?: number;
        tabs?: IWinTab[];
        activeTabID?: number;
        index?: number;
    }
}

export interface IWinStoreAction extends Action<string> {
    payload: {
        add?: Store<IWin, IWinAction>;
        del?: Store<IWin, IWinAction>;
        source?: Store<IWin, IWinAction>;
        dest?: Store<IWin, IWinAction>
    }
}