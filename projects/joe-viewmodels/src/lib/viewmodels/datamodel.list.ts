import {
    ChangeSet,
    Tobject,
    Logger,
    JoeLogger,
    sameObject,
    ArrayViewFactory,
    isBlank,
    asString,
    JsonObj,
    Tstring,
    Tnumber,
    AnyDef,
    isString
} from 'joe-fx';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ViewModelManager} from '../viewmodel.manager';
import {queryAny} from '../queries';
import {RuntimeEntry, IViewModel, CommandNotification, DocEntry, Entry, EntryCallback, IRuntimeContext} from '../types';
import {isPromise} from '../helpers';

export class ListDataModel<T> implements IViewModel {
    // #region Properties

    // _region Properties (14)
    static readonly LEASE = 1000;

    private readonly _dataCache: DocEntry[];

    private _error: Error | undefined;
    private _loadCount = 0;
    private _nullview: T[];
    private _view: T[];

    readonly entry: RuntimeEntry;
    readonly onStateChanged: Subject<string>;
    readonly type: AnyDef;
    readonly viewAsync: BehaviorSubject<T[]>;

    contextname: string;
    runningOp: string | undefined;

    // #endregion Properties

    // #region Public Accessors

    // _endregion Constructors (1)

    // _region Public Accessors (4)
    get error(): Error | undefined {
        return this._error;
    }

    get loadCount(): number {
        return this._loadCount;
    }

    get loaded(): boolean {
        return this._view !== this._nullview;
    }

    get running(): boolean {
        return this.runningOp !== undefined;
    }

    get unloaded(): boolean {
        return this._view === this._nullview || this.runningOp !== undefined;
    }

    get view(): T[] {
        return this._view;
    }

    // #endregion Public Accessors

    // #region Constructors

    // _endregion Properties (14)

    // _region Constructors (1)
    constructor(entry: RuntimeEntry, type: AnyDef, parentContext?: IRuntimeContext) {
        this.entry = entry;
        this.type = type;
        this.contextname = type.title;
        entry.instance = this;
        entry.active = true;
        this._nullview = [];
        this._view = this._nullview;
        if (parentContext) {
            entry.parentContext = parentContext;
            const parentContextEntry = parentContext.entry as RuntimeEntry;
            const parentContextEntryDependencies = parentContextEntry.dependencies || [];
            if (!parentContextEntryDependencies.includes(this)) {
                parentContextEntryDependencies.push(this);
            }
            parentContextEntry.dependencies = parentContextEntryDependencies;
        }

        this._dataCache = [];
        this.onStateChanged = new Subject<string>();
        this.viewAsync = new BehaviorSubject<T[]>([]);
        this.resetLifecycleValidity();
    }

    // #endregion Constructors

    // #region Protected Methods

    // _endregion Public Accessors (4)

    // _region Public Methods (17)
    protected convertToError(err: any): Error | undefined {
        if (isBlank(err)) {
            return undefined;
        }
        if (err instanceof Error) {
            return err as Error;
        }
        if (isString(err)) {
            return new Error(err);
        }
        var errorMessage = 'Unknown Error';
        if (!!err) {
            if (err.error) {
                if (asString(err.error)) {
                    errorMessage = err.error;
                } else {
                    return this.convertToError(err.error);
                }

            } else if (err.data) {
                if (asString(err.data)) {
                    errorMessage = err.data;
                } else {
                    return this.convertToError(err.data);
                }

            } else if (err.message) {
                errorMessage = err.message;
            }
        }
        return new Error(errorMessage);
    }

    // #endregion Protected Methods

    // #region Public Methods

    public clearError(raiseEvent = false): void {
        this.runningOp = undefined;
        if (this.entry.parentContext) {
            this.entry.parentContext.clearError();
        } else {
            this._error = undefined;
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

    handled(): void {
        if (this.entry) {
            this.entry.handled = true;
        }
    }

    invalidCacheNotification(key: string, query: JsonObj, deprecatedCallback: EntryCallback): void {
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

    loadAsyncRequest(data$: Promise<T[]> | Observable<T[]>, objType?: Tobject<T>, forceLocalError = false): Promise<T[]> {
        const self = this;
        if (!this.runningOp) {
            this.runningOp = 'Loading';
        }
        if (isPromise(data$)) {
            return data$
                .then((json: T[]) => {
                    self.loadData(json, objType);
                    return self.view;
                })
                .catch((err) => {
                    self.setError(err, forceLocalError);
                    return Promise.reject(err);
                });
        }

        return new Promise<T[]>((resolve, reject) => {
            (data$ as Observable<T[]>).subscribe({
                next: (json: T[]) => {
                    self.loadData(json, objType);
                    resolve(self.view);
                },
                error: (err) => {
                    self.setError(err, forceLocalError);
                    reject(err);
                }
            });
        });
    }

    loadData(data: T[], objType?: AnyDef) {
        const dataType = objType || this.type;
        if (data.length > 0
            && dataType instanceof Tobject
            && (dataType as Tobject).index?.sort) {
            data = ArrayViewFactory.SortFromPropertyList(data, (dataType as Tobject).index!.sort as string[]);
        }
        this.setView(data);
    }

    notifyStateChanged(clearRunningOp: boolean = true) {
        if (clearRunningOp) {
            this.runningOp = undefined;
        }
        this.onStateChanged.next(CommandNotification.StateChanged);
        this.viewAsync.next(this._view!);
    }

    onLoad(): void {
        JoeLogger.log('ListDataModel<T>.onLoad()');
    }

    onRelease(): void {
        return;
    }

    page(size: number, index: number): T[] {
        return this._view.slice(index * size, (index + 1) * size);
    }

    release(): void {
        JoeLogger.headedInfo('RELEASED', this.contextname);
        this.onRelease();
        this.entry.parentContext = undefined;
        this.entry.dependencies = undefined;
        this.entry.instance = null;
        this._view = this._nullview;
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

    setError(err: any, forceLocal: boolean = false) {
        if (isBlank(err)) {
            this.clearError();
        } else {
            this.handled();
            this.runningOp = undefined;
            const error = this.convertToError(err);
            // const error = err;
            if (this.entry.parentContext && !forceLocal) {
                this.entry.parentContext.setError(error);
            } else {
                this._error = error;
                JoeLogger.error(error || 'Erase any contextual error.');
                this.onStateChanged.next(CommandNotification.StateChanged);
            }
        }
    }

    setView(value: T[]) {
        this.handled();
        this._view = value;
        this._loadCount++;
        this.runningOp = undefined;
        this.onLoad();
        this.notifyStateChanged(false)
    }

    terminate(): void {
        if (this.entry) {
            this.entry.active = false;
        }
    }

    trace(logger: Logger): void {
        // console.group( 'ListView: ' + this.contextname + ' -> ' +  this.entry.query );
        logger.info('ListView Model: ' + this.contextname);
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

        logger.indent();
        for (const entry of this._dataCache) {
            logger.headedInfo(
                'Cache entry: ' + entry.key + ' -> ' + entry.query,
                Array.isArray(entry.doc) ? 'DOC-ARRAY' : 'DOC'
            );
        }
        logger.unindent();
    }

    whenLoaded(): Promise<this> {
        const self = this;
        return new Promise<this>((resolve, reject) => {
            if (self.loaded) {
                resolve(self);
            } else {
                const sub = new Subscription();
                try {
                    sub.add(
                        self.onStateChanged.subscribe((p) => {
                            if (p === CommandNotification.StateChanged && self.loaded) {
                                resolve(self);
                                sub.unsubscribe();
                            }
                        })
                    );
                } catch (err) {
                    reject(err);
                }
            }
        });
    }

    // #endregion Public Methods
    // _endregion Public Methods (17)
}
