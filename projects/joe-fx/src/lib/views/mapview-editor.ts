import {
    PATH_LOCAL,
    PropertyTypology,
    BaseProperty,
    StringMap,
    EditCache,
    ChangeSet,
    Scalar,
    JoeLogger,
    ChangeStateEnum,
    MetadataHelper,
    IViewElement,
    IEditor,
    isEmptyObj,
    asRelativePathWithSelector,
    DataAction,
    ValidationScopes
} from '../core';
import { Tmap } from '../types';

export const MAPKEY: symbol = Symbol('__map-key__');
export class MapviewEditor<T extends Scalar | IViewElement> implements IEditor {
    public readonly isNew: any | undefined;
    constructor(private _srcItem: IViewElement, private _keys: string[]) {
        this.editCache = { inserted: {}, deleted: {}, modified: {} };
        const src = _srcItem.$src;
        this.isNew = (src.type as Tmap).isNew(src.obj);
    }

    public readonly editCache: EditCache<StringMap<T>>;

    protected get hasScalarItems(): boolean {
        const type = this._srcItem.$src.type as Tmap;
        return type.itemsTypeDef!.kind === PropertyTypology.Scalar;
    }

    public isDirty(property: string): boolean {
        if (property === PATH_LOCAL) {
            return !this.isPristine();
        } else {
            return (
                this.isInsertedItem(property) ||
                this.isDeletedItem(property) ||
                this.isModifiedItem(property)
            );
        }
    }

    public isPristine(): boolean {
        return (
            isEmptyObj(this.editCache.modified) &&
            isEmptyObj(this.editCache.inserted) &&
            isEmptyObj(this.editCache.deleted)
        );
    }
    public isTouched(): boolean {
        if (!this.isPristine()) {
            return true;
        }
        const children = this._srcItem.$children() as StringMap<IViewElement>;
        for (const childProp in children) {
            if (children.hasOwnProperty(childProp)) {
                const child = children[childProp];
                if (child.$isEditing) {
                    if (child.$editor!.isTouched()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    public isInsertedItem(property: string): boolean {
        return this.editCache.inserted[property] !== undefined;
    }

    public isDeletedItem(property: string): boolean {
        return this.editCache.deleted[property] !== undefined;
    }

    public isModifiedItem(property: string): boolean {
        return this.editCache.modified[property] !== undefined;
    }

    public itemChangeState(item: any): ChangeStateEnum {
        if (this.isInsertedItem(item)) {
            return ChangeStateEnum.inserted;
        } else if (this.isDeletedItem(item)) {
            return ChangeStateEnum.deleted;
        } else if (this.isModifiedItem(item)) {
            return ChangeStateEnum.updated;
        }
        return ChangeStateEnum.none;
    }

    public get hasDeletedItem(): boolean {
        return !isEmptyObj(this.editCache.deleted);
    }

    // public isDeleted(): boolean {
    //   return this._state === EntityState.Deleted;
    // }

    public cancel(property: string) {
        if (this.editCache.inserted[property]) {
            delete this.editCache.inserted[property];
        }
        if (this.editCache.deleted[property]) {
            delete this.editCache.deleted[property];
        }
        if (this.editCache.modified[property]) {
            delete this.editCache.modified[property];
        }
    }

    public original(property: string): T {
        return this._srcItem.$src.obj[property];
    }

    public set(key: string, keys: string[], view: T | undefined): void {
        const keyIndex = keys.indexOf(key);
        const [prevValue, prevStatus] = this.changeState(key);
        const mapview = this._srcItem;
        const assignFunc = () => {
            if (keyIndex === -1) {
                keys.push(key);
            }
            mapview[key] = view;
            if (!mapview.hasScalarItems) {
                (view as unknown as any)[MAPKEY] = key;
                const docElementView = view as IViewElement;
                docElementView.$src.setParent(key, mapview.$src);
                mapview.$src.setParentChildView(view as IViewElement, key);
            }
            mapview.validate(ValidationScopes.AddChild, key);
            mapview.$notify({
                action: DataAction.Added,
                sourcePath: mapview.$src.path,
                dataPath: key
            });
        };

        const clearFunc = () => {
            if (keyIndex > -1) {
                mapview.validate(ValidationScopes.RemoveChild, key);
                keys.splice(keyIndex, 1);
                delete mapview[key];
            }
            mapview.$notify({
                action: DataAction.Removed,
                sourcePath: mapview.$src.path,
                dataPath: key
            });
        };

        switch (prevStatus) {
            case ChangeStateEnum.none:
                if (prevValue) {
                    if (view !== prevValue) {
                        if (!view) {
                            this.editCache.deleted[key] = prevValue;
                            clearFunc();
                        } else {
                            this.editCache.modified[key] = view;
                            assignFunc();
                        }
                    }
                } else {
                    if (view) {
                        this.editCache.inserted[key] = view;
                        assignFunc();
                    }
                }
                break;
            case ChangeStateEnum.inserted:
                if (view !== prevValue) {
                    if (!view) {
                        delete this.editCache.inserted[key];
                        clearFunc();
                    } else {
                        this.editCache.inserted[key] = view;
                        assignFunc();
                    }
                }
                break;
            case ChangeStateEnum.updated:
                if (view !== prevValue) {
                    if (!view) {
                        delete this.editCache.modified[key];
                        this.editCache.deleted[key] = this.original(key);
                        clearFunc();
                    } else {
                        this.editCache.modified[key] = view;
                        assignFunc();
                    }
                }
                break;
            case ChangeStateEnum.deleted:
                if (view) {
                    delete this.editCache.deleted[key];
                    if (view !== prevValue) {
                        this.editCache.modified[key] = view;
                    }
                    assignFunc();
                }
                break;
        }
    }

    public changeState(property: string): [T, ChangeStateEnum] {
        let value = this.editCache.inserted[property];
        if (value) {
            return [value, ChangeStateEnum.inserted];
        }
        value = this.editCache.deleted[property];
        if (value) {
            return [value, ChangeStateEnum.deleted];
        }
        value = this.editCache.modified[property];
        if (value) {
            return [value, ChangeStateEnum.updated];
        }
        return [this._srcItem[property], ChangeStateEnum.none];
    }

    public validate(): string[] | undefined {
        return undefined;
    }

    public endEdit(fromParent: boolean = false): any {
        if (!fromParent) {
            const rootView = this._srcItem.$root();
            return rootView.$editor!.endEdit(true);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
        } else {
            const src = this._srcItem.$src;
            const type = src.type as Tmap;
            const mapObj = src.obj;
            JoeLogger.indent();
            JoeLogger.action('End Edit', type.title);
            const deletedKeys = Object.keys(this.editCache.deleted) || [];
            deletedKeys.forEach((key) => src.write(key, undefined));

            const insertedKeys = Object.keys(this.editCache.inserted) || [];
            const modifiedKeys = Object.keys(this.editCache.modified) || [];
            if (this.hasScalarItems) {
                insertedKeys.forEach((k) => {
                    const insertedScalar = this.editCache.inserted[k];
                    src.write(k, insertedScalar);
                });
                modifiedKeys.forEach((k) => {
                    const modifiedScalar = this.editCache.modified[k] as any;
                    src.write(k, modifiedScalar);
                });
            } else {
                insertedKeys.forEach((k) => {
                    const entity = this.editCache.inserted[k] as unknown as IViewElement;
                    if (entity.$isEditing) {
                        const child = entity.$editor!.endEdit(true);
                        if (child && !MetadataHelper.getTypeInfo(child).attached) {
                            type.prepare(child, mapObj, k);
                        }
                        src.write(k, child);
                    }
                });

                modifiedKeys.forEach((k) => {
                    const entity = this.editCache.inserted[k] as unknown as IViewElement;
                    if (entity.$isEditing) {
                        entity.$editor!.endEdit(true);
                    }
                });
                this._keys.forEach((k) => {
                    const entity = this._srcItem[k] as unknown as IViewElement;
                    if (entity.$isEditing) {
                        const child = entity.$editor!.endEdit(true);
                        src.write(k, child);
                    }
                });
            }
            JoeLogger.action('Editor release', type.title);
            JoeLogger.unindent();
            const result = this._srcItem.$src.obj;
            this._srcItem.$editor = undefined;
            return result;
        }
    }

    public cancelEdit(fromParent: boolean = false) {
        if (!fromParent) {
            const rootView = this._srcItem.$root();
            rootView.$editor!.cancelEdit(true);
            rootView.validate(ValidationScopes.EnforceState);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
        } else if (this.editCache) {
            const mapView = this._srcItem as StringMap<T>;
            const src = this._srcItem.$src;
            const editCache = this.editCache;
            Object.keys(editCache.inserted).forEach((k) => delete mapView[k]);
            Object.keys(editCache.deleted).forEach((k) => (mapView[k] = editCache.deleted[k]));
            this._keys = Object.keys(src.obj);
            if (!this.hasScalarItems) {
                this._keys.forEach((k) => {
                    const child = mapView[k] as IViewElement;
                    if (child && child.$isEditing) {
                        child.$editor!.cancelEdit(true);
                    }
                }, this);
            } else {
                this._keys.forEach((k) => (mapView[k] = src.obj[k]));
            }
            this._srcItem.$validation.clear();
        }
    }

    public writeChangeSet(changeset: ChangeSet): void {
        const [relativePath, selector] = asRelativePathWithSelector(this._srcItem.$src.path);
        if (this.isNew) {
            changeset.push({
                op: ChangeStateEnum.inserted,
                path: relativePath,
                obj: this._srcItem.$json(),
                selector
            });
            return;
        }

        if (this.isDirty(PATH_LOCAL)) {
            const atype = this._srcItem.$src.type as Tmap;
            const scalarItems = atype.itemsTypeDef!.kind === PropertyTypology.Scalar;
            const delKeys = Object.keys(this.editCache.deleted) || [];
            if (delKeys.length > 0) {
                for (const delKey of delKeys) {
                    const delvalue = this.editCache.deleted[delKey];
                    changeset.push({
                        op: ChangeStateEnum.deleted,
                        path: this._srcItem.$src.childPath(delKey),
                        obj: delvalue
                    });
                }
            }
            const newKeys = Object.keys(this.editCache.inserted) || [];
            if (newKeys.length > 0) {
                for (const newKey of newKeys) {
                    const newvalue = this.editCache.inserted[newKey];
                    if (scalarItems) {
                        changeset.push({
                            op: ChangeStateEnum.inserted,
                            path: this._srcItem.$src.childPath(newKey),
                            obj: newvalue
                        });
                    } else if (MetadataHelper.asView(newvalue)) {
                        changeset.push({
                            op: ChangeStateEnum.inserted,
                            path: this._srcItem.$src.childPath(newKey),
                            obj: newvalue.$src.type.title
                        });
                        if (newvalue.$isEditing) {
                            newvalue.$editor!.writeChangeSet(changeset);
                        }
                    }
                }
            }
            const updKeys = Object.keys(this.editCache.inserted) || [];
            if (updKeys.length > 0) {
                for (const updKey of updKeys) {
                    const updvalue = this.editCache.deleted[updKey];
                    if (scalarItems) {
                        changeset.push({
                            op: ChangeStateEnum.updated,
                            path: this._srcItem.$src.childPath(updKey),
                            obj: updvalue
                        });
                    } else if (MetadataHelper.asView(updvalue)) {
                        if (updvalue.$isEditing) {
                            updvalue.$editor!.writeChangeSet(changeset);
                        }
                    }
                }
            }
        }
    }
    public applyChangeSet(changeset: ChangeSet): void {
        return;
    }
}
