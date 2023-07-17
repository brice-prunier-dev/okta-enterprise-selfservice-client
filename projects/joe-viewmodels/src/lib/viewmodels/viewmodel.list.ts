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
    Tarray,
    Objview,
    Setview,
    IRootEditor,
    DataPayload,
    DataAction
} from 'joe-fx';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ViewModelManager} from '../viewmodel.manager';
import {queryAny} from '../queries';
import {CommandNotification, IViewModel, RuntimeEntry, DocEntry, Entry, EntryCallback, IRuntimeContext} from '../types';
import {isPromise} from '../helpers';

export class ListViewModel<T, V extends Objview<T>> implements IViewModel {
    // #region Properties

    static readonly LEASE = 1000;

    private readonly _dataCache: DocEntry[];
    private readonly _vmSubscriptions: Subscription;

    private _error: Error | undefined;
    private _loadCount = 0;
    private _loadingSub: Subscription | undefined;
    private _nullview: Setview<V>;
    private _view: Setview<V>;

    readonly entry: RuntimeEntry;
    // lastChanges: ChangeSet;
    readonly onStateChanged: Subject<string>;
    readonly type: Tarray;
    readonly viewAsync: BehaviorSubject<Setview<V>>;

    contextname: string;
    runningOp: string | undefined;

    // #endregion Properties

    // #region Public Accessors

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

    get view(): Setview<V> {
        return this._view;
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(entry: RuntimeEntry, type: Tarray, parentContext?: IRuntimeContext) {
        this._vmSubscriptions = new Subscription();
        this.entry = entry;
        this.type = type;
        this.contextname =`View List (${type.title})`;
        entry.instance = this;
        entry.active = true;
        this._nullview =
            this.type.viewctor !== undefined
                ? (new this.type.viewctor([], this.type) as Setview<V>)
                : (ArrayViewFactory.Create([], this.type) as Setview<V>);
        this._view = this._nullview;
        if (parentContext) {
            entry.parentContext = parentContext;
            const parentContextEntry = parentContext.entry as RuntimeEntry;
            const parentContextEntryDependencies = parentContextEntry.dependencies || [];
            if (!parentContextEntryDependencies.includes(this as IRuntimeContext)) {
                parentContextEntryDependencies.push(this as IRuntimeContext);
            }
            parentContextEntry.dependencies = parentContextEntryDependencies;
        }

        this._dataCache = [];
        this.onStateChanged = new Subject<string>();
        this.viewAsync = new BehaviorSubject<Setview<V>>(this._nullview);
        this.resetLifecycleValidity();
    }

    // #endregion Constructors

    // #region Private Methods

    private _onViewEditingStateChanged() {
        if (this._view.$isEditing) {
            JoeLogger.debug(
                'VM - ' +
                this.contextname +
                ' --- IS SUBSCRIBING TO EDITING VIEW -> ' +
                this.type.title +
                this.type.getIndexPath(this.view)
            );
            const onViewChanged = (this._view.$root().$editor! as IRootEditor).onViewChanged!;
            this._vmSubscriptions.add(
                onViewChanged!.subscribe(this._viewNotificationHandle.bind(this))
            );
        } else {
            JoeLogger.debug(
                'VM - ' +
                this.contextname +
                ' --- IS ENDDING LISTENNING TO READONLY VIEW -> ' +
                this.type.title +
                this.type.getIndexPath(this.view)
            );
            // this._vmSubscriptions.unsubscribe();
            this.runningOp = undefined;
            this.onStateChanged.next(CommandNotification.StateChanged);
            this.viewAsync.next(this._view!);
            const view = this._view;
            setTimeout(() => view.validate(), 300);
        }
    }

    private _viewNotificationHandle(notif: DataPayload) {
        JoeLogger.group('VM - ' + this.contextname + ' --- RECEIVED A NOTIFICATION ');
        JoeLogger.info(notif);
        JoeLogger.endgroup();
        const msg =
            notif.action === DataAction.Validation
                ? DataAction.Validation
                : CommandNotification.StateChanged;
        JoeLogger.group('VM - ' + this.contextname + ' --- RESEND NOTIFICATION - ' + msg);
        JoeLogger.info(msg);
        JoeLogger.endgroup();
        this.onStateChanged.next(msg);
    }

    // #endregion Private Methods

    // #region Protected Methods

    protected convertToError(err: any): Error | undefined {
        if (isBlank(err)) {
            return undefined;
        }
        if (err instanceof Error) {
            return err as Error;
        }
        var errorMessage = 'Unknown Error';
        if (!!err) {
            if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
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
            }
        }
        return new Error(errorMessage);
    }

    // #endregion Protected Methods

    // #region Public Methods

    clearError(raiseEvent = false): void {
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

    loadAsyncRequest(data$: Promise<T[]> | Observable<T[]>, forceLocalError = false): Promise<Setview<V>> {
        const self = this;
        if (!this.runningOp) {
            this.runningOp = 'Loading';
        }
        if (isPromise(data$)) {
            return data$
                .then((json: T[]) => {
                    self.loadData(json);
                    return self.view;
                })
                .catch((err) => {
                    self.setError(err, forceLocalError);
                    return Promise.reject(err);
                });
        }

        return new Promise<Setview<V>>((resolve, reject) => {
            (data$ as Observable<T[]>).subscribe({
                next: (json: T[]) => {
                    self.loadData(json);
                    resolve(self.view);
                },
                error: (err) => {
                    self.setError(err, forceLocalError);
                    reject(err);
                }
            });
        });
    }

    loadData(data: T[]) {
        this.type.prepare(data);

        const setview =
            this.type.viewctor !== undefined
                ? (new this.type.viewctor(data, this.type) as Setview<V>)
                : (ArrayViewFactory.Create(data, this.type) as Setview<V>);

        this.setView(setview);
    }

    notifyStateChanged(clearRunningOp: boolean = true) {
        if (clearRunningOp) {
            this.runningOp = undefined;
        }
        this.onStateChanged.next(CommandNotification.StateChanged);
        this.viewAsync.next(this._view!);
    }

    onLoad(): void {
        JoeLogger.log('ListViewModel<T>.onLoad()');
    }

    onRelease(): void {
        return;
    }

    page(size: number, index: number): V[] {
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

    setError(err: any, forceLocalError = false) {
        if (isBlank(err)) {
            this.clearError();
        } else {
            this.handled();
            const error = this.convertToError(err);
            this.runningOp = undefined;
            if (!forceLocalError && this.entry.parentContext) {
                this.entry.parentContext.setError(error);
            } else {
                this._error = error;
                JoeLogger.error(
                    error || 'Call to setError(undefined) to clear any ViewModel error!'
                );
                this.onStateChanged.next(CommandNotification.StateChanged);
            }
        }
    }

    setView(value: Setview<V>) {
        this.handled();
        this.runningOp = undefined;
        if (this._view !== value) {
            if (this._view.onEditingChanged !== undefined) {
                this._view.onEditingChanged = undefined;
            }
            if (value.length > 0
                && this.type.hasObjectItems
                && (this.type.items as Tobject).index?.sort) {
                value = ArrayViewFactory.SortFromPropertyList<V>(
                    value,
                    (this.type.items as unknown as Tobject).index!.sort as string[]) as Setview<V>;
            }

            this._view = value;
            this._loadCount++;
            this.onLoad();
            this.viewAsync.next(value);
            this.onStateChanged.next(CommandNotification.StateChanged);
        }
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
