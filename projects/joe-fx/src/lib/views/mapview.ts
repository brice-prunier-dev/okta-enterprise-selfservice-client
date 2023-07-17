import {
    AType,
    DataPayload,
    MType,
    MapProperty,
    MapviewType,
    ObjviewType,
    PropertyTypology,
    Scalar,
    SetviewTypeConstructor,
    StringMap,
    MetadataHelper,
    IDataInfo,
    IViewElement,
    ListValidationState,
    ValidationState,
    JsonObj,
    PATH_ROOT,
    PATH_UNASSIGNED,
    ChangeSet,
    asObject,
    ValidationScopes,
    JoeLogger,
    IRootViewElement
} from '../core';
import { Tmap, MapViewFactory, corelateValidationWithParents } from '../types';
import { MAPKEY, MapviewEditor } from './mapview-editor';

export class Mapview<T extends Scalar | IViewElement>
    implements Iterable<T>, IViewElement, StringMap<T>
{
    [key: string]: any;

    private _keys: string[];
    private _parent_: IViewElement | undefined;
    private _ver = 1;
    public $editor?: MapviewEditor<T>;
    public $validation: ListValidationState;
    public onEditingChanged?: () => void;

    // #endregion
    // #region Properties & Iterator
    public [Symbol.iterator]() {
        const keys = this.keys();
        let iterarorIndex = 0;
        const readItem: (s: string) => T = this.get;
        return {
            next(): IteratorResult<T> {
                if (iterarorIndex < keys.length) {
                    return {
                        done: false,
                        value: readItem(keys[++iterarorIndex]) as T
                    };
                } else {
                    return {
                        done: true,
                        value: readItem(keys[keys.length - 1]) as T
                    };
                }
            }
        };
    }

    public $hasScalarItems(): boolean {
        return (this.$src.type as Tmap).itemsTypeDef!.kind === PropertyTypology.Scalar;
    }

    // #endregion
    // #region Constructor & Init
    constructor(obj: any, type?: MType, parent?: IViewElement) {
        if (obj === undefined) {
            obj = {};
        } else if (Array.isArray(obj)) {
            throw new Error(`Mapview as no Array as source...`);
        }
        this._parent_ = parent;
        if (!parent && type) {
            type!.prepare(obj, null, PATH_ROOT);
        }

        MetadataHelper.link(obj, this, type as Tmap);
        this._keys = [];

        this.$validation = new ListValidationState();
        this._keys = Object.keys(obj) || [];

        const itemInfo = (type as Tmap).itemsTypeDef as MapProperty;
        const selfAsParent = this as IViewElement;
        this._keys.forEach((p) => {
            if (!this[p]) {
                const entity = itemInfo.readAsView(obj, p, selfAsParent) as T;
                (entity as unknown as any)[MAPKEY] = p;
                this[p] = entity;
            }
        });
    }

    // #endregion
    // #region IViewElement
    public $assign(valueToAssign: any): this {
        if (asObject(valueToAssign)) {
            const editor = this.$edit();
            const chekDeleted = this.$isEditing && this.$editor!.hasDeletedItem;
            const atype = this.$src.type as MType;
            for (const assignKey of Object.keys(valueToAssign)) {
                const child = this[assignKey];
                const childObj = valueToAssign[assignKey];
                if (child) {
                    if (this.$hasScalarItems()) {
                        this.set(assignKey, valueToAssign[childObj]);
                    } else {
                        (child as IViewElement).$assign(childObj);
                    }
                } else if (chekDeleted && editor.isDeletedItem(assignKey)) {
                    continue;
                }
                const itemInfo = atype.itemsTypeDef as MapProperty;
                const childView = this.$newChild().$assign(childObj) as T;
                this.set(assignKey, childView);
            }
        }
        return this;
    }

    /**
     * Accesor on children entities
     */
    public $children(): StringMap<IViewElement> {
        const map: StringMap<IViewElement> = {};

        if (this._keys && (this.$src.type as Tmap).itemsTypeDef!.kind !== PropertyTypology.Scalar) {
            for (const key of this._keys) {
                map[key] = this[key];
            }
        }
        return map;
    }
    /**
     * Editing property flag
     */
    public get $isEditing(): boolean {
        return this.$editor !== undefined;
    }
    /**
     * Is root property flag
     */
    public $isRoot(): boolean {
        return this._parent_ === undefined;
    }
    /**
     * New child entity helper method
     * @param childType: Child constructor.
     */
    public $newChild<Ta extends IViewElement>(): Ta {
        const tt = (this.$src.type as Tmap).itemsTypeDef!.def as any;
        const itemType = tt.type as string;
        let child: Ta;
        switch (itemType) {
            case 'object':
                const otype = tt.viewctor as ObjviewType;
                child = new otype(undefined, this) as Ta;
                break;
            case 'array':
                const atype = tt.viewctor as SetviewTypeConstructor;
                child = new atype([], tt as AType, this) as Ta;
                break;
            case 'map':
                const mtype = tt as MapviewType;
                child = new mtype({}, tt as MType, this) as Ta;
                break;
            default:
                throw new Error(`Unknow ${itemType} on ${this.$src.type.title}`);
        }
        tt.prepare(child.$src.obj, this.$src.obj, PATH_UNASSIGNED);
        child.$edit();
        return child;
    }
    /**
     * Parent element accessor (self if none).
     */
    public $parent(): IViewElement {
        return this._parent_ === undefined ? this : this._parent_;
    }
    /**
     * Free resources when the element is no more used.
     */
    public $release(): void {
        if (!this.hasScalarItems) {
            for (const key of this.keys()) {
                const item = this.get(key) as IViewElement;
                item.$release();
            }
        }
        this.$editor = undefined;
        this._keys = [];
        this._parent_ = undefined;
        MetadataHelper.clearTypeInfo(self);
    }
    /**
     * Root element accessor (self if is root).
     */
    public $root(): IRootViewElement {
        let parent = this._parent_;
        while (parent && !parent.$isRoot()) {
            if (parent !== parent.$parent()) {
                parent = parent.$parent();
            } else {
                throw new Error('Infinite loop on Objview.$root()!');
            }
        }
        return (parent || this) as IRootViewElement;
    }
    /**
     * Element info accessor.
     * Is undefined if not prepared.
     */
    public get $src(): IDataInfo {
        return MetadataHelper.getTypeInfo(this);
    }

    public $json(): JsonObj {
        const data: any = {};
        if (this.hasScalarItems) {
            for (const p of this._keys) {
                data[p] = this[p];
            }
        } else {
            for (const p of this._keys) {
                data[p] = this[p].$json();
            }
        }
        return data as unknown as JsonObj;
    }

    // #endregion
    // #region Methods
    /**
     * Clone the map on the same data and set
     * @param parent Clone the map on the same data
     */
    public clone(parent?: IViewElement): Mapview<T> {
        const cloneObj = JSON.parse(JSON.stringify(this.$src.obj));
        return new Mapview<T>(cloneObj, this.$src.type as MType, parent);
    }
    /**
     * Star edit mode by returning an IEditor.
     * If it was editing, the previous editor is retrun.
     */
    public $edit(forceTracking: boolean = false): MapviewEditor<T> {
        if (!this.$editor) {
            JoeLogger.debug(this.$src.type.title + ' -> ' + this.$src.path + ' --- EDIT.');
            const isRoot = this.$isRoot();
            if (!isRoot) {
                this._parent_!.$edit();
            }

            this.$editor = new MapviewEditor<T>(this, this._keys);
            if (isRoot && this.onEditingChanged !== undefined) {
                const type = this.$src.type;
                JoeLogger.debug(
                    this.$src.type.title +
                        ' -> ' +
                        this.$src.path +
                        ' --- IS NOTIFYING ITS EDITING STATE.'
                );

                this.onEditingChanged!();
            }
        }
        return this.$editor;
    }

    /**
     * Value accessor.
     * @param key : key value.
     */
    public get(key: string): T {
        return this[key];
    }

    /**
     * Return the map key for the input value
     * @param value map value
     * @returns key value
     */
    public keyOf(value: any): string {
        if (this.hasScalarItems) {
            if (this._keys) {
                for (const prop of this._keys) {
                    if (value === this[prop]) {
                        return prop;
                    }
                }
            }
        } else {
            return value[MAPKEY];
        }
        return '';
    }

    /**
     * A Mapview has some owned properties,
     * so it needs a dedicated methods to list key values used as "map key"
     * @returns All map keys
     */
    public keys(): string[] {
        return this._keys.slice();
    }

    /**
     * Map Length
     */
    public get length(): number {
        return this._keys ? this._keys.length : 0;
    }

    /**
     * method specific to ViewElement that is used on property changed.
     * It bubbles the change describe in the arg payload to the root of the model hierarchy.
     * The root element of a model expose an observable
     * @param arg
     */
    public $notify(arg: DataPayload) {
        this._ver++;
        if (!this.$isRoot()) {
            this.$parent().$notify(arg);
        }
    }

    public set(key: string, view: T | undefined): this {
        this.$edit().set(key, this._keys, view);
        return this;
    }

    public $refresh(data: any): void {
        const src = this.$src;
        const path = src.path;
        const mtype = src.type as MType;
        if (!src.isRoot) {
            this.$parent().$refresh;
        } else {
            mtype.prepare(data, undefined, PATH_ROOT);

            this.$src.obj = data;
            const changeSet = [] as ChangeSet;

            if (this.$isEditing) {
                this.$editor!.writeChangeSet(changeSet);
                this.$editor!.cancelEdit();
            }

            src.obj = data;
            const array = data as any[];
            if (!parent) {
                mtype.prepare(data, null, PATH_ROOT);
            }

            if (!mtype.isScalar && this._keys) {
                this._keys.forEach((value) => (this[value] as IViewElement).$release());
            }

            this._keys = [];

            this._keys = Object.keys(data) || [];
            const itemInfo = mtype.itemsTypeDef as MapProperty;
            this._keys.forEach((p) => {
                if (!this[p]) {
                    const entity = itemInfo.readAsView(data, p, this) as T;
                    (entity as unknown as any)[MAPKEY] = p;
                    this[p] = entity;
                }
            });

            if (changeSet.length > 0) {
                this.$edit().applyChangeSet(changeSet);
            }
        }
    }

    public $refreshChild(property: string, data: any): void {
        const src = this.$src;
        const mtype = src.type as MType;
        if (!mtype.isScalar) {
            return;
        }
        const mapObj = this.$src.obj;

        const oldData = mapObj[property];
        if (oldData) {
            MetadataHelper.detach(oldData);
        }

        mapObj[property] = data;
        const itemInfo = mtype.itemsTypeDef as MapProperty;
        itemInfo.prepare(mapObj, data, property);

        const viewExists = this._keys.includes(property);
        if (viewExists) {
            this[property] = itemInfo.readAsView(data, property, this) as T;
        }
    }

    public validate(
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const type = this.$src.type;
        const validationContext = this.$validation;
        type.validate(this, scope, scopeRef);
        corelateValidationWithParents(this);
        validationContext.debug(type.title + ' - ' + scope, this.$isRoot());
        return validationContext;
    }

    public asString(): string {
        return 'Map of ' + this.$src.type.title;
    }
    // #endregion
}

MapViewFactory.InitializeConstructor(Mapview);
