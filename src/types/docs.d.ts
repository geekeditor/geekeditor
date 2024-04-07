import { EventEmitterInstance } from "../utils/eventemitter";
import { EPlatformType, PlatformParams } from "./platform";
import { MEOutlineItem } from "@geekeditor/meditable/dist/types/types/index.d";

export enum EDocsNodeType {
    EDocsNodeTypeDoc,
    EDocsNodeTypeDir
}

export enum EDocsProviderType {
    EDocsProviderTypeMemory,
    EDocsProviderTypeBrowser,
    EDocsProviderTypeLocal,
    EDocsProviderTypeFSA,
    EDocsProviderTypeGitHub,
    EDocsProviderTypeGitee,
    EDocsProviderTypeGitLab
}

export interface IDocsNodeOptions {
    nodeType: EDocsNodeType;
    dao?: IDocsDAO;
    data?: IDocsNodeData;
    parentNode?: IDocsNodeBase;
    store?: IDocsNodeStore;
    deprecated?: boolean;
}


export enum EDocsNodeChangeType {
    EDocsNodeChangeTypeTitle,
    EDocsNodeChangeTypeTitleSaved,
    EDocsNodeChangeTypeContent,
    EDocsNodeChangeTypeChildren,
    EDocsNodeChangeTypeRemoved,
    EDocsNodeChangeTypeMounted,
    EDocsNodeChangeTypeSaving,
    EDocsNodeChangeTypeLoading,
    EDocsNodeChangeTypeRemoving,
    EDocsNodeChangeTypeMoving,
    EDocsNodeChangeTypeChanging,
    EDocsNodeChangeTypeStatusChanged,
    EDocsNodeChangeTypeDropTargetChanged,
    EDocsNodeChangeTypeEditable,
    EDocsNodeChangeTypeConfigsLoading,
    EDocsNodeChangeTypeConfigs,
    EDocsNodeChangeTypeOutline,
}

export interface IDocsSaver {
    save: () => Promise<boolean>;
}


export interface IDocsFileUploadResult {
    filename: string;
    url: string;
}

export interface IDocsAssetUploadResult {
    assetName:string;
    assetDoc?:string;
    assetRepo?:string;
    assetBase?:string;
    file:File|Blob;
    url?: string;
}

export interface IDocsAssetLoadResult {
    assetName:string;
    assetDoc:string;
    assetRepo:string;
    assetBase:string;
    file:File|Blob;
}

export interface IDocsImageHosting {
    init: () => Promise<IInitResult>;
    checkHostMatched: (url: string) => boolean;
    uploadImage: (file: File|Blob, onUploadProgress?: (progressEvent: any) => void) => Promise<undefined | IDocsFileUploadResult>;
    uploadSVG: (svg: string, onUploadProgress?: (progressEvent: any) => void) => Promise<undefined | IDocsFileUploadResult>;
}

export enum EInitResultStatus {
    EInitResultStatusSuccess,
    EInitResultStatusNoBranch,
    EInitResultStatusFail
}

export interface IInitResult {
    status: EInitResultStatus;
    msg?: string;
}

export interface IDocsData {
    rootID: string;
    uniqueID: string;
    init: () => Promise<IInitResult>;
    query: (id: string, type: number, refresh?: boolean) => Promise<IDocsDataItem[]>;
    find: (id: string, refresh?: boolean) => Promise<IDocsDataItem | undefined>;
    loadContent: (id: string, refresh?: boolean) => Promise<IDocsDataItem[]>;
    add: (doc: IDocsDataItem) => Promise<string | undefined>;
    update: (doc: IDocsDataItem) => Promise<string | undefined>;
    delete: (doc: IDocsDataItem) => Promise<boolean>;
    queryConfigs: () => Promise<IDocsDataItem[]>;
    loadConfig: (id: string) => Promise<IDocsDataItem[]>;
    addConfig: (doc: IDocsDataItem) => Promise<string | undefined>;
    updateConfig: (doc: IDocsDataItem) => Promise<string | undefined>;
    deleteConfig: (doc: IDocsDataItem) => Promise<boolean>;
    move: (doc: IDocsDataItem) => Promise<boolean>;
    uploadAsset: (id: string, asset: File|Blob|string, assetName?: string)=>Promise<IDocsAssetUploadResult|undefined>;
    loadAsset: (id: string, assetName: string)=>Promise<IDocsAssetLoadResult|undefined>;
    title: string;
    platform: EPlatformType;
}

export interface IDocsDAO {
    id?: string;
    parentNode: IDocsNodeBase | undefined;
    load: (refresh?: boolean) => Promise<IDocsDataItem[]>
    loadContent: (refresh?: boolean) => Promise<IDocsDataItem[]>
    save: (data: IDocsNodeData) => Promise<boolean>;
    delete: (keepChildren?: boolean) => Promise<boolean>;
    createNode: (options: IDocsNodeOptions) => Promise<IDocsNodeBase | undefined>;
    moveTo: (parentNode: IDocsNodeBase, toInsertBefore?: string, toInsertAfter?: string) => Promise<boolean>;
    provider: IDocsCreateDAO;
    uploadAsset: (asset: File|Blob|string, assetName?: string)=>Promise<IDocsAssetUploadResult|undefined>;
    loadAsset: (assetName: string)=>Promise<IDocsAssetLoadResult|undefined>;
}

export interface IDocsCreateDAO extends IDocsNodeBase {
    createDAO: (options: IDocsDAOOptions) => IDocsDAO;
}

export enum EDocsNodeBaseStatus {
    EDocsNodeBaseStatusNone,
    EDocsNodeBaseStatusCopy,
    EDocsNodeBaseStatusCut,
}

export interface IDocsNodeBase extends IDocsSaver, EventEmitterInstance {
    id?: string;
    tempID: string;
    title: string;
    setTitle: (title: string) => void;
    extension?: string;
    content: string;
    setEditable: (editable: MEditable) => void;
    setMonacoBridge?: (bridge: MonacoBridge) => void;
    nodeType: EDocsNodeType;
    deprecated: boolean;
    providerType: EDocsProviderType;
    providerID: string;
    children: IDocsNodeBase[];
    hasChildren?: boolean;
    configs?: IDocsNodeBase[];
    isConfig?: boolean;
    isChanged: boolean;
    isLoaded: boolean;
    isContentLoaded?: boolean;
    isSaving: boolean;
    isLoading: boolean;
    isContentLoading?: boolean;
    load: (refresh?: boolean) => Promise<boolean>;
    loadContent?: (refresh?: boolean) => Promise<boolean>;
    parentNode: IDocsNodeBase | undefined;
    remove: (keepChildren?: boolean) => Promise<boolean>;
    removeChild?: (child: IDocsNodeBase) => Promise<boolean>;
    isRemoving: boolean;
    isRemoved?: boolean;
    isMoving: boolean;
    mount: (atFirst?: boolean) => Promise<boolean>;
    moveTo: (parentNode: IDocsNodeBase, toInsertBefore?: string, toInsertAfter?: string) => Promise<boolean>;
    createNode: (options: IDocsNodeOptions) => Promise<IDocsNodeBase | undefined>;
    supportCreateNode: (nodeType: EDocsNodeType) => boolean;
    supportReloadNode: boolean;
    supportEditing?: boolean;
    onChanged: (handler: (changeType: EDocsNodeChangeType, data?: any) => void) => void;
    offChanged: (handler: (changeType: EDocsNodeChangeType, data?: any) => void) => void;
    destroy: () => void;
    notifyChangedHandlers: (changeType: EDocsNodeChangeType, data?: any) => void;
    isRoot: boolean;
    root: IDocsNodeBase;
    actived: () => void;
    deactived: () => void;
    canMove: boolean;
    setStatus: (status: EDocsNodeBaseStatus) => void;
    status: EDocsNodeBaseStatus;
    dropType?: number;
    outlines?: MEOutlineItem[];
    activeOutlineId?: string;
    scrollOutlineIntoView?: (id: string) => void;
    find: (filterRegex: RegExp) => Promise<IDocsSearchResult[]>
}

export interface IDocsDAOOptions {
    type: EDocsNodeType;
    id?: string;
    parentNode?: IDocsNodeBase;
    isConfig?: boolean;
    extension?: string;
}

export interface IDocsProvider extends IDocsNodeBase {
    isConfigsLoaded: boolean;
    isConfigsLoading: boolean;
    queryConfigs: () => Promise<boolean>;
}





export interface IDocsNode extends IDocsNodeBase {
    store: () => IDocsNodeStore;
    setDAO: (dao: IDocsDAO) => void;
    onRemoved: () => void;
    offRemoved: () => void;
    wordCount: number;
    editable: MEditable;
}

export interface IDocsNodeData {
    title?: string;
    cover?: string;
    extension?: string;
    content?: string;
    isConfig?: boolean;
    hasChildren?: boolean;
}

export interface IDocsNodeState {
    content: string;
    title: string;
    cover: string;
    extension: string;
    changed: boolean;
}

export interface IDocsNodeStore extends IDocsSaver {
    setContent: (content: string) => void;
    getContent: () => string;
    setTitle: (content: string) => void;
    getTitle: () => string;
    setExtension: (extension: string) => void;
    getExtension: () => string;
    saved: () => boolean;
    setSaver: (saver: IDocsSaver) => void;
    subscribe: (listener: () => void) => Unsubscribe;
}

export interface IDocsDataItem {
    id?: string;
    pid?: string;
    before?: string;
    after?: string;
    title: string;
    type: number;
    content?: string;
    cover?: string;
    deprecated?: boolean;
    isConfig?: boolean;
    extension?: string;
    hasChildren?: boolean;
    keepChildren?: boolean;
    children?: IDocsDataItem[]
}


export interface IDocsProviderSettingInfo {
    doc_repo: PlatformParams;
    image_repo: PlatformParams;
    title: string;
    id: string;
}

export interface IDocsProviderOptions {
    type: EDocsProviderType,
    title: string,
    id: string,
    providerID: string,
    data: IDocsData,
    image?: IDocsImageHosting,
    parentNode: IDocsNodeBase;
}

export interface IDocsSearchResult {
    key?: string;
    node: IDocsNodeBase;
    match: RegExpMatchArray;
}

export interface IDocsIndexItem {
    type: EDocsNodeType;
    id: string;
    title: string;
    children?: IDocsIndexItem[];
}

export interface IDocsIndex extends IDocsIndexItem{
    version: number;
    updated: number;
    created: number;
    children: IDocsIndexItem[];
}