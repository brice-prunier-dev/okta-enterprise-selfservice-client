import {CommandNotification, IViewModel, DocEntry, Entry, EntryCallback, IRuntimeContext, RuntimeEntry} from '../types';
import {isPromise} from '../helpers';
import {ChangeSet, JoeLogger, JsonObj, sameObject, Tobject, Logger, MetadataHelper} from 'joe-fx';
import {queryAny} from '../queries';
import {Observable, Subject, Subscription} from 'rxjs';
import {ViewModelManager} from '../viewmodel.manager';
import {OitemType} from 'joe-models';

export class DetailDataModel<T = any> implements IViewModel {
    // #region Properties

    public static LEASE = 1000;

    private readonly _dataCache: DocEntry[];

    private _loadCount = 0;
    private _loadingSub: Subscription | undefined;
    private _view: T | undefined;

    readonly entry: RuntimeEntry;
    readonly type: Tobject;

    public contextname: string;
    public error: any;
    public lastChanges?: ChangeSet;
    public onStateChanged: Subject<string>;
    runningOp?: string;

    // #endregion Properties

    // #region Public Accessors

    public get loaded(): boolean {
        return this.view !== undefined;
    }

    get loadCount(): number {
        return this._loadCount;
    }

    get running(): boolean {
        return this.runningOp !== undefined;
    }

    get unloaded(): boolean {
        return this.view === undefined && this.runningOp === undefined;
    }

    get view(): T | undefined {
        return this._view;
    }

    set view(value: T | undefined) {
        this._view = value;
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(entry: RuntimeEntry, type: Tobject = OitemType, parentContext?: IRuntimeContext) {
        entry.parentContext = parentContext;
        this.entry = entry;
        this.type = type;
        this.contextname =`Data (${type.title})`;
        entry.instance = this;
        entry.active = true;
        if (parentContext) {
            const parentContextEntry = parentContext.entry as RuntimeEntry;
            const parentContextEntryDependencies = parentContextEntry.dependencies || [];
            if (!parentContextEntryDependencies.includes(this)) {
                parentContextEntryDependencies.push(this);
            }
            parentContextEntry.dependencies = parentContextEntryDependencies;
        }
        this._dataCache = [];
        this.onStateChanged = new Subject<string>();
    }

    // #endregion Constructors

    // #region Public Methods

    clearError(raiseEvent = false): void {
        this.runningOp = undefined;
        if (this.entry.parentContext) {
            this.entry.parentContext.clearError();
        } else {
            this.error = undefined;
            JoeLogger.debug(`ViewModel: "${this.contextname}" clear error!`);
            if (raiseEvent) {
                this.onStateChanged.next(CommandNotification.StateChanged);
            }
        }
    }

    contains(doc: any | any[]): boolean {
        for (const docEntry of this._dataCache) {
            if (docEntry.doc === doc) {
                return true;
            }
        }
        return false;
    }

    getCacheEntries(): Entry[] {
        return this._dataCache.map<Entry>((e) => {
            return {key: e.key, query: e.query} as Entry;
        });
    }

    getCacheEntry(key: string, query: JsonObj): DocEntry | undefined {
        if (!this.entry.active) {
            return undefined;
        }
        return this._dataCache.find((c) => c.key === key && sameObject(c.query, query));
    }

    public handled(): void {
        if (this.entry) {
            this.entry.handled = true;
        }
    }

    invalidCacheNotification(
        key: string,
        query: JsonObj,
        deprecatedCallback: EntryCallback
    ): void {
        let clearAll = key === '*' && query === queryAny;
        if (!clearAll) {
            for (let index = this._dataCache.length - 1; index > -1; index--) {
                const docEntry = this._dataCache[index];
                if (
                    docEntry.key === key &&
                    (query === queryAny || sameObject(docEntry.query, query))
                ) {
                    clearAll = true;
                    break;
                }
            }
        }
        if (clearAll) {
            for (const docEntry of this._dataCache) {
                JoeLogger.debug(
                    'To release: ' + docEntry.key + ' - ' + JSON.stringify(docEntry.query, null, 2)
                );
                deprecatedCallback(docEntry.doc);
            }
            this.terminate();
        }
    }

    loadAsyncRequest(data$: Promise<T> | Observable<T>, objType?: Tobject<T>, forceLocalError = false): Promise<T> {
        const self = this;
        if (!this.runningOp) {
            this.runningOp = 'Loading';
        }
        if (isPromise(data$)) {
            return data$
                .then((json: T) => {
                    self.loadData(json, objType);
                    return Promise.resolve(self.view!);
                })
                .catch((err) => {
                    self.setError(err, forceLocalError);
                    return Promise.reject(err);
                });
        }

        return new Promise<T>((resolve, reject) => {
            (data$ as Observable<T>).subscribe({
                next: (json: T) => {
                    self.loadData(json, objType);
                    resolve(self.view!);
                },
                error: (err) => {
                    self.setError(err, forceLocalError);
                    reject(err);
                }
            });
        });
    }

    setView(value: T) {
        this.handled();
        this._view = value;
        this._loadCount++;
        this.runningOp = undefined;
        this.onLoad();
        this.notifyStateChanged(false);
    }

    loadData(data: T, objType?: Tobject<any>): void {
        const dataType = objType || this.type;
        const jsonUnprepared = MetadataHelper.isNotPrepared(data);
        if (jsonUnprepared) {
            if (dataType) {
                dataType.prepare(data);
            }
        }
        this.setView(data);
    }

   
    notifyStateChanged(clearRunningOp: boolean = true) {
        if (clearRunningOp) {
            this.runningOp = undefined;
        }
        this.onStateChanged.next(CommandNotification.StateChanged);
    }

    onLoad(): void {
        JoeLogger.log('ListDataModel<T>.onLoad()');
    }

    onRelease(): void {
        return;
    }

    release(): void {
        JoeLogger.headedInfo('RELEASED', this.contextname);
        this.onRelease();
        this.entry.parentContext = undefined;
        this.entry.dependencies = undefined;
        this.entry.active = false;
        this.entry.instance = null;
        this._view = undefined;
        this.onStateChanged.unsubscribe();
    }

    resetLifecycleValidity() {
        if (this.entry) {
            this.entry.validity = ViewModelManager.LEASE_DATE();
            if (this.entry.dependencies) {
                this.entry.dependencies.forEach((dep) => dep.resetLifecycleValidity());
            }
        }
    }

    setDocInLocalCache(key: string, query: JsonObj, doc: JsonObj | JsonObj[]): void {
        const entry = this._dataCache.find((c) => c.key === key && sameObject(c.query, query));
        if (entry) {
            entry.doc = doc;
        } else {
            this._dataCache.push({key, query, doc});
        }
    }

    setError(error: any, forceLocalError = false): void {
        if (!forceLocalError && this.entry.parentContext) {
            this.entry.parentContext.setError(error);
        } else {
            this.error = error;
            JoeLogger.error(error);
            this.onStateChanged.next(CommandNotification.StateChanged);
        }
    }

    terminate(): void {
        if (this.entry) {
            this.entry.active = false;
        }
    }

    trace(logger: Logger): void {
        logger.info('ObjView Model: ' + this.contextname);
        if (this.entry) {
            logger.action('query', JSON.stringify(this.entry.query));
            if (this.entry.active) {
                logger.info('active');
            } else {
                logger.info('to terminate');
            }
        } else {
            logger.info('detached');
        }
        logger.data('cache size', this._dataCache.length);

        if (this._dataCache.length > 0) {
            logger.indent();
            for (const entry of this._dataCache) {
                logger.headedInfo(
                    'Cache entry: ' + entry.key + ' -> ' + JSON.stringify(entry.query),
                    'DOC'
                );
            }
            logger.unindent();
        }
    }

    whenLoaded(): Promise<this> {
        const self = this;
        return new Promise<this>((resolve, reject) => {
            if (self.loaded) {
                resolve(self);
            } else {
                try {
                    this._loadingSub = self.onStateChanged.subscribe((p) => {
                        if (p === CommandNotification.StateChanged && self.loaded) {
                            if (self._loadingSub) {
                                self._loadingSub.unsubscribe();
                            }
                            resolve(self);
                        }
                    });
                } catch (err) {
                    if (self._loadingSub) {
                        self._loadingSub.unsubscribe();
                    }
                    reject(err);
                }
            }
        });
    }

    // #endregion Public Methods
}
