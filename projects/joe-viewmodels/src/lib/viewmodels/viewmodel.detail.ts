import {
    asString,
    isFunction,
    asArray,
    ChangeSet,
    Objview,
    Tobject,
    MetadataHelper,
    Logger,
    JoeLogger,
    sameObject,
    IViewElement,
    StringMap,
    JsonObj,
    ValidationRule,
    AsyncValidationRule,
    DataAction,
    DataPayload,
    IRootEditor
} from 'joe-fx';
import {CommandNotification, IViewModel, RuntimeEntry, DocEntry, EntryCallback, Entry, IRuntimeContext} from '../types';
import {isPromise} from '../helpers';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ViewModelManager} from '../viewmodel.manager';
import {queryAny} from '../queries';

export enum ViewEditState {
    none = 'none',
    editable = 'editable',
    editing = 'editing',
    readonly = 'readonly'
}

export interface IViewModelBehavior<V> {
    // #region Properties

    after_create?: (source: V) => void;
    after_error?: (err: any) => void;
    after_remove?: (source: V) => void;
    after_save?: (source: V) => void;
    before_remove?: (source: V) => void;
    before_save?: (source: V) => void;
    notify?: (message: string, action: string) => void;

    // #endregion Properties
}

export abstract class DetailViewModel<T, V extends Objview<T>> implements IViewModel {
    // #region Properties

    static LEASE = 1000;

    private readonly _dataCache: DocEntry[];
    private readonly _vmSubscriptions: Subscription;

    private _asyncrules:
        | ({[P in keyof T]?: AsyncValidationRule<T>} & {_?: AsyncValidationRule<T>})
        | undefined;
    private _loadCount = 0;
    private _loadingSub: Subscription | undefined;
    private _nullview: V;
    private _rules:
        | ({[P in keyof T]?: ValidationRule<T>} & {_?: ValidationRule<T>})
        | undefined;
    private _view: V;
    private _viewChangeset?: ChangeSet;

    readonly currents: StringMap<IViewElement>;
    readonly entry: RuntimeEntry;
    readonly onStateChanged: Subject<string>;
    readonly type: Tobject;
    readonly viewAsync: BehaviorSubject<V>;

    contextname: string;
    editBehavior?: IViewModelBehavior<DetailViewModel<T, V>>;
    error: any;
    lastChanges?: ChangeSet;
    runningOp?: string;

    // #endregion Properties

    // #region Public Accessors

    get asyncrules(): {[P in keyof T]?: AsyncValidationRule<T>} & {_?: AsyncValidationRule<T>} {
        return this._asyncrules || {};
    }

    get editing(): boolean {
        return !!this.view.$isEditing;
    }

    get isNewView(): boolean {
        return this.loaded && this.type ? !this.type.getRevValue(this._view) : false;
    }

    get loadCount(): number {
        return this._loadCount;
    }

    get loaded(): boolean {
        return this._view !== this._nullview;
    }

    get rules(): {[P in keyof T]?: ValidationRule<T>} & {_?: ValidationRule<T>} {
        return this._rules || {};
    }

    set rules(value: {[P in keyof T]?: ValidationRule<T>} & {_?: ValidationRule<T>}) {
        this._rules = value;
        this._view.$rules = value;
    }

    get running(): boolean {
        return this.runningOp !== undefined;
    }

    get unloaded(): boolean {
        return this._view === this._nullview && this.runningOp === undefined;
    }

    get view(): V {
        return this._view;
    }

    // #endregion Public Accessors

    // #region Constructors

    constructor(entry: RuntimeEntry, type: Tobject, parentContext?: IRuntimeContext) {
        this._vmSubscriptions = new Subscription();
        this._rules = {};
        this._asyncrules = {};
        this.entry = entry;
        this.type = type;
        entry.instance = this;
        entry.active = true;
        this._nullview = new type.viewctor!(type.defaultValue()) as V;
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
        this.contextname = `View (${type.title})`;
        this._dataCache = [];
        this.currents = {};
        this.resetLifecycleValidity();
        this.onStateChanged = new Subject<string>();
        this.viewAsync = new BehaviorSubject<V>(this._nullview);
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

    protected persistAsync(view: V): Promise<void> {
        return Promise.resolve();
    }

    // #endregion Protected Methods

    // #region Public Methods

    public clearError(raiseEvent = false): void {
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
                    if (this.editing) {
                        if (asArray(docEntry.doc)) {
                            this._dataCache.splice(index, 1);
                            JoeLogger.debug(
                                'To release: ' +
                                docEntry.key +
                                ' - ' +
                                JSON.stringify(docEntry.query, null, 2)
                            );

                            deprecatedCallback(docEntry.doc);
                        }
                    } else {
                        clearAll = true;
                        break;
                    }
                }
            }
        }
        if (clearAll) {
            for (const docEntry of this._dataCache) {
                JoeLogger.debug(
                    'To release: ' + docEntry.key + ' - ' + JSON.stringify(docEntry.query, null, 2)
                );
                deprecatedCallback(docEntry.doc!);
            }
            this.terminate();
        }
    }

    isNullView(view: V): boolean {
        return this._nullview === view;
    }

    loadAsyncRequest(data: Promise<T> | Observable<T>, objType?: Tobject<T>, forceLocalError = false): Promise<V> {
        if (!this.runningOp) {
            this.runningOp = 'Loading';
        }
        const self = this;
        if (isPromise(data)) {
            return data
                .then((json: T) => {
                    self.loadData(json, objType);
                    return self.view;
                })
                .catch((err) => {
                    self.setError(err, forceLocalError);
                    return Promise.reject(err);
                });
        }

        return new Promise<V>((resolve, reject) => {
            (data as Observable<T>).subscribe({
                next: (json: T) => {
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

    loadData(data: any, objType?: Tobject<any>): void {
        const dataType = objType || this.type;
        const jsonUnprepared = MetadataHelper.isNotPrepared(data);
        if (jsonUnprepared) {
            if (dataType) {
                dataType.prepare(data);
            }
        }
        this.setView(new dataType.viewctor!(data) as V);
    }

    notifyStateChanged(clearRunningOp: boolean = true) {
        if (clearRunningOp) {
            this.runningOp = undefined;
        }
        this.onStateChanged.next(CommandNotification.StateChanged);
        this.viewAsync.next(this._view!);
    }

    onLoad(): void {
        return;
    }

    release(): void {
        JoeLogger.headedInfo('RELEASED', this.contextname);
        const currentNames = Object.keys(this.currents);
        if (currentNames && currentNames.length > 0) {
            currentNames.forEach((name) => delete this.currents[name], this);
        }
        this.entry.active = false;
        this.entry.parentContext = undefined;
        this.entry.dependencies = undefined;
        this.entry.instance = null;
        this._view = this._nullview;
        this._dataCache.splice(0, this._dataCache.length);
    }

    resetLifecycleValidity() {
        if (this.entry) {
            this.entry.validity = ViewModelManager.LEASE_DATE();
            if (this.entry.dependencies) {
                this.entry.dependencies.forEach((dep) => dep.resetLifecycleValidity());
            }
        }
    }

    restoreState() {
        if (this.view) {
            this.view.$edit().applyChangeSet(this._viewChangeset!);
        }
    }

    saveAsync(): Promise<void> {
        JoeLogger.group('SAVE on ' + this.contextname);
        this.resetLifecycleValidity();
        const editBehavior = this.editBehavior;
        if (this.editBehavior && this.editBehavior.before_save) {
            this.editBehavior.before_save(this);
        }
        const isValid = !this.view.validate().withError();
        if (isValid) {
            const self = this;
            const cs: ChangeSet = [];
            this.view!.$editor!.writeChangeSet(cs);
            this.lastChanges = cs;
            this.error = undefined;
            this.runningOp = 'Saving';
            this.onStateChanged.next(CommandNotification.StateChanged);
            return this.persistAsync(this.view)
                .then(() => {
                    if (self.view!.$isEditing) {
                        self.view!.$editor!.endEdit();
                    }
                    if (self.isNewView) {
                        if (self.editBehavior && self.editBehavior.after_create) {
                            self.editBehavior.after_create(self);
                        }
                        if (self.editBehavior && self.editBehavior.notify) {
                            self.editBehavior.notify(self.view!.asString(), 'Created');
                        }
                    } else {
                        if (self.editBehavior && self.editBehavior.after_save) {
                            self.editBehavior.after_save(self);
                        }
                        if (self.editBehavior && self.editBehavior.notify) {
                            self.editBehavior.notify(self.view!.asString(), 'Updated');
                        }
                    }
                    self.runningOp = undefined;
                    JoeLogger.info(
                        'SEND NOTIF - StateChanged from Detail ViewModel ' + self.contextname
                    );
                    self.onStateChanged.next(CommandNotification.StateChanged);
                    JoeLogger.endgroup();
                })
                .catch((err) => {
                    self.setError(err);
                    if (self.editBehavior && self.editBehavior.notify) {
                        self.editBehavior.notify('Failed', 'Save');
                    }
                    JoeLogger.endgroup();
                    return Promise.reject(err);
                });
        } else {
            this.onStateChanged.next(CommandNotification.StateChanged);
            if (this.editBehavior && this.editBehavior.notify) {
                this.editBehavior.notify('With error(s)...', 'Validation');
            }
            JoeLogger.debug('VALIDATION NOT OK');
            JoeLogger.endgroup();

            return Promise.reject(new Error('VALIDATION NOT OK'));
        }
    }

    // endSaveAsync() {
    //     if (this.view!.$isEditing) {
    //         this.view!.$editor!.endEdit();
    //     }
    //     if (this.isNewView) {
    //         if (this.editBehavior && this.editBehavior.after_create) {
    //             this.editBehavior.after_create(this);
    //         }
    //         if (this.editBehavior && this.editBehavior.notify) {
    //             this.editBehavior.notify(this.view!.asString(), 'Created');
    //         }
    //     } else {
    //         if (this.editBehavior && this.editBehavior.after_save) {
    //             this.editBehavior.after_save(this);
    //         }
    //         if (this.editBehavior && this.editBehavior.notify) {
    //             this.editBehavior.notify(this.view!.asString(), 'Updated');
    //         }
    //     }
    //     this.runningOp = undefined;
    //     JoeLogger.info('SEND NOTIF - StateChanged from Detail ViewModel ' + this.contextname);
    //     this.onStateChanged.next(CommandNotification.StateChanged);
    //     JoeLogger.endgroup();
    // }
    // public current = false;
    setDocInLocalCache(key: string, query: JsonObj, doc: JsonObj | JsonObj[]): void {
        const entry = this._dataCache.find((c) => c.key === key && sameObject(c.query, query));
        if (entry) {
            entry.doc = doc;
        } else {
            this._dataCache.push({key, query, doc});
        }
    }

    setError(error: any, forceLocalError = false) {
        this.handled();
        this.runningOp = undefined;
        if (!forceLocalError && this.entry.parentContext) {
            this.entry.parentContext.setError(error);
        } else {
            this.error = error;
            JoeLogger.group('ERROR on ' + this.contextname);
            JoeLogger.error(error);
            JoeLogger.endgroup();
            this.onStateChanged.next(CommandNotification.StateChanged);
        }
    }

    setView(value: V) {
        this.handled();
        if (this._view !== value) {
            // unset old;
            if (this._view.onEditingChanged !== undefined) {
                this._view.onEditingChanged = undefined;
                // this._vmSubscriptions.unsubscribe();
            }
            this._view.$rules = undefined;
            this._view.$asyncrules = undefined;
            this._view = value;
            this._loadCount++;
            // init new
            this._view.$rules = this._rules;
            this._view.$asyncrules = this._asyncrules;
            if (!this.isNullView(value)) {
                this._view.onEditingChanged = this._onViewEditingStateChanged.bind(this);
                JoeLogger.debug('VM - ' + this.contextname + ' ---  IS WAITTING FOR VIEW TO EDIT.');
                if (this._view.$isEditing) {
                    this._view.onEditingChanged();
                }
            }
            this.runningOp = undefined
            this.onLoad();
            this.notifyStateChanged(false);
        }
    }

    spareState() {
        if (this.editing) {
            const cs: ChangeSet = [];
            this.view.$editor!.writeChangeSet(cs);
            this._viewChangeset = cs;
        }
    }

    terminate(): void {
        this._vmSubscriptions.unsubscribe();
        this._rules = undefined;
        this._asyncrules = undefined;
        this._view.onEditingChanged = undefined;
        this._view.$asyncrules = undefined;
        this._view.$rules = undefined;
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
