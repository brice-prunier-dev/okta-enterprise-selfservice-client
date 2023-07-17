import {JsonObj, AnyDef, isJsObject, asString, isFunction, Tobject, Logger} from 'joe-fx';
import {Subject, Subscribable} from 'rxjs';

// ────────────────────────────────────────────────────────────────────────────────

export enum CommandNotification {
    StateChanged = 'STATE-CHANGED',
    DataChanged = 'DATA-CHANGED',
    CommandDelete = 'DELETED'
}

/**
 * Interface implemented by classes that need to release references for GC
 */
export interface IReleasable {
    release(): void;
}

export interface INotifier {
    notify(message: string, action: string): void;
    notifyFunc(): (message: string, action: string) => void;
}

export interface ICache {
    getCacheEntries(): Entry[];
    getCacheEntry(key: string, query: JsonObj): DocEntry | undefined;
    invalidCacheNotification(key: string, query: JsonObj, deprecatedCallback: EntryCallback): void;
    setDocInLocalCache(key: string, query: JsonObj, doc: JsonObj | JsonObj[]): void;
    contains(doc: any | any[]): boolean;
}

export interface Entry {
    key: string;
    query: JsonObj;
}

export interface DocEntry extends Entry {
    doc: JsonObj | JsonObj[];
}


export interface RuntimeEntry extends Entry {
    instance: IRuntimeContext | null;
    validity: Date;
    current?: boolean;
    active?: boolean;
    handled?: boolean;
    static?: boolean;
    dependencies?: IRuntimeContext[];
    parentContext?: IRuntimeContext;
}

export interface IRuntimeContext extends ICache, IReleasable {
    contextname: string;
    entry: RuntimeEntry;
    error: any;
    loaded: boolean;
    type: AnyDef;
    terminate(): void;
    setError(error: any): void;
    clearError(): void;
    resetLifecycleValidity(): void;
}


export interface IViewModel extends IRuntimeContext {
    loaded: boolean;
    entry: RuntimeEntry;
    onStateChanged: Subject<string>;
    trace(logger: Logger): void;
}


export interface IViewModelManager {
    resolveCurrentViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj
    ): T;

    resolveStaticViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj,
        area?: string
    ): T;

    resolveDependentViewModel<T extends IRuntimeContext>(
        vmtype: ViemModelConstructor<T>,
        query: JsonObj,
        owner: IRuntimeContext
    ): T;

    turnIntoReleasableViewModel(vmtype: ViemModelConstructor<any>, query: JsonObj): void;

    getCurrentViewModel(): IRuntimeContext;

    getOneAsync<T>(
        query: JsonObj,
        caller: any,
        call: () => Promise<T>,
        objType?: Tobject
    ): Promise<T>;

    getManyAsync<T>(
        query: JsonObj,
        caller: any,
        call: () => Promise<T[]>,
        objType?: Tobject,
        sort?: string[]
    ): Promise<T[]>;
}


export type EntryCallback = (preparedDoc: JsonObj | JsonObj[]) => void;
export type ViemModelConstructor<T extends IRuntimeContext> = new (entry: RuntimeEntry, parentContext?: IRuntimeContext) => T;
