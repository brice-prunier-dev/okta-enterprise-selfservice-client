import {
    PATH_LOCAL,
    readPath,
    asRelativePathWithSelector,
    PropertyTypology,
    DataPayload,
    StringMap,
    ChangeSet,
    ChangeStateEnum,
    ChangeItem,
    JoeLogger,
    isScalar,
    isBlank,
    MetadataHelper,
    IViewElement,
    IEditor,
    cacheValueAsValue,
    isAssigned,
    isDataAssigned,
    Property,
    ValidationScopes
} from '../core';
import { Tobject } from '../types';
import { Subject } from 'rxjs';
import { Objview } from './objview';

export class ObjviewEditor<T> implements IEditor {
    // #region Properties (3)
    public readonly isNew: any | undefined;
    public readonly editCache: any | undefined;

    // private _state: EntityState = EntityState.Original;
    public onViewChanged?: Subject<DataPayload>;

    // #endregion Properties (3)

    // #region Constructors (1)

    constructor(private _srcItem: Objview<T>) {
        this.editCache = {};
        const src = this._srcItem.$src;
        this.isNew = (src.type as Tobject).isNew(src.obj);
        if (_srcItem.$isRoot() || this.isNew) {
            this.onViewChanged = new Subject<DataPayload>();
        }
    }

    // #endregion Constructors (1)

    // #region Public Accessors (1)

    public isPristine(): boolean {
        const editKeys = Object.keys(this.editCache);
        return editKeys === undefined || editKeys.length === 0;
    }

    // #endregion Public Accessors (1)

    // #region Public Methods (10)

    public applyChangeSet(changeset: ChangeSet): void {
        if (changeset) {
            for (const change of changeset) {
                this._applyChange(change);
            }
        }
    }

    public canSave(): boolean {
        if (this.isDirty(PATH_LOCAL)) {
            return !this._srcItem.validate()?.withError();
        }
        return false;
    }

    // public cancelChange(property: string): void {
    //     if (this.editCache[property]) {
    //         delete this.editCache[property];
    //     }
    // }

    public cancelEdit(fromParent: boolean = false) {
        if (!fromParent) {
            const rootView = this._srcItem.$root();
            rootView.$editor!.cancelEdit(true);
            rootView.validate(ValidationScopes.EnforceState);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
        } else {
            const view = this._srcItem;
            const src = view.$src;
            const type = src.type as Tobject<T>;
            JoeLogger.action('Cancel Edit', this._consoleInfo(type));
            const children = view.$children() as StringMap<IViewElement>;
            const childrenKeys = Object.keys(children);
            if (childrenKeys && childrenKeys.length > 0) {
                JoeLogger.indent();
                Object.keys(children).forEach((property) => {
                    JoeLogger.debug(property);
                    const propInfo = type.allProperties[property as keyof T] as Property;
                    if (propInfo.kind !== PropertyTypology.Scalar) {
                        const value = children[property];
                        if (value.$isEditing) {
                            JoeLogger.debug(property);
                            value.$editor!.cancelEdit(true);
                        }
                    }
                }, this);
                JoeLogger.unindent();
            }
            this._srcItem.$validation.clear();
            this._srcItem.$editor = undefined;
        }
    }

    public endEdit(fromParent: boolean = false): any {
        if (!fromParent) {
            const rootView = this._srcItem.$root();
            const rootResult = rootView.$editor!.endEdit(true);
            if (rootView.onEditingChanged !== undefined) {
                rootView.onEditingChanged!();
            }
            return rootResult;
        } else {
            const src = this._srcItem.$src;
            const type = src.type as Tobject<T>;
            JoeLogger.action('End Edit', this._consoleInfo(type));
            if (src.detached && this.isPristine()) {
                return undefined;
            } else {
                JoeLogger.indent();
                const editedProps = Object.keys(this.editCache);
                if (editedProps && editedProps.length > 0) {
                    editedProps.forEach((property) => {
                        if (
                            type.allProperties[property as keyof T].kind === PropertyTypology.Scalar
                        ) {
                            JoeLogger.debug(property);
                            src.write(property, cacheValueAsValue(this.editCache[property]));
                        }
                    }, this);
                    editedProps.forEach((property) => {
                        const propInfo = type.allProperties[property as keyof T];
                        if (propInfo.kind !== PropertyTypology.Scalar) {
                            const value = cacheValueAsValue(
                                this.editCache[property]
                            ) as IViewElement;
                            if (value) {
                                JoeLogger.debug(property);
                                let valueObj = value.$src.obj;
                                if (value.$isEditing) {
                                    valueObj = value.$editor!.endEdit(true);
                                }
                                if (valueObj && !MetadataHelper.getTypeInfo(valueObj).attached) {
                                    type.prepare(valueObj, src.obj, property);
                                }
                                src.write(property, valueObj);
                            }
                        }
                    }, this);
                }
                const children = this._srcItem.$children() as StringMap<IViewElement>;
                const childrenKeys = Object.keys(children);
                if (childrenKeys && childrenKeys.length > 0) {
                    childrenKeys.forEach((property) => {
                        JoeLogger.debug(property);
                        const propInfo = type.allProperties[property as keyof T];
                        if (propInfo.kind !== PropertyTypology.Scalar) {
                            const value = children[property] as IViewElement;
                            if (value && value.$isEditing) {
                                JoeLogger.debug(property);
                                if (!propInfo.required && !value.$editor?.isTouched()) {
                                    value.$editor!.cancelEdit(true);
                                } else {
                                    const valueObj = value.$editor!.endEdit(true);
                                    if (value.$src.detached) {
                                        type.prepare(valueObj, src.obj, property);
                                    }
                                    src.write(property, valueObj);
                                }
                            }
                        }
                    }, this);
                }
                JoeLogger.unindent();
                JoeLogger.action('Editor Release', this._consoleInfo(type));
                const result = this._srcItem.$src.obj;
                this._srcItem.$editor = undefined;
                return result;
            }
        }
    }

    // public asDeleted(): void {
    //   this._state = EntityState.Deleted;
    // }

    // public asOriginal(): void {
    //   this._state = EntityState.Original;
    // }

    // public asNew(): void {
    //   this._state = EntityState.Added;
    // }
    public isDirty(property: string = PATH_LOCAL): boolean {
        if (property === PATH_LOCAL) {
            return !this.isPristine();
        } else {
            return !isBlank(this.editCache[property]);
        }
    }

    public isRequired(property: string): boolean {
        const type = this._srcItem.$src.type as Tobject<T>;
        const propInfo = type.allProperties[property as keyof T];
        return isAssigned(propInfo) ? propInfo.required : false;
    }

    public isTouched(): boolean {
        if (!this.isPristine()) {
            return true;
        }
        const children = this._srcItem.$children();
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

    public message(property: '_' | keyof T): StringMap | undefined {
        return this._srcItem.$validation.withError()
            ? this._srcItem.$validation.errors![property]
            : undefined;
    }

    // public isNew(): boolean {
    //   return ( this._srcItem.$isRoot() && this._srcItem.$src.obj[ '_rev' ] === undefined );
    // }

    // public isDeleted(): boolean {
    //   return this._state === EntityState.Deleted;
    // }
    public writeChangeSet(changeset: ChangeSet) {
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
        const dirtyViewKeys: string[] = [];

        if (this.isDirty(PATH_LOCAL)) {
            const dirtyKeys = Object.keys(this.editCache);
            const dirtyScalarKeys: StringMap<any> = {};
            let dirtyScalarKeysCount = 0;
            for (const dirtyKey of dirtyKeys) {
                const dirtyValue = this.editCache[dirtyKey];
                if (!isDataAssigned(dirtyValue)) {
                    dirtyScalarKeys[dirtyKey] = null;
                    dirtyScalarKeysCount++;
                } else if (isScalar(dirtyValue)) {
                    dirtyScalarKeys[dirtyKey] = dirtyValue;
                    dirtyScalarKeysCount++;
                } else if (MetadataHelper.asView(dirtyValue)) {
                    dirtyViewKeys.push(dirtyKey);
                }
            }
            if (dirtyScalarKeysCount > 0) {
                changeset.push({
                    op: ChangeStateEnum.updated,
                    path: this._srcItem.$src.path,
                    obj: dirtyScalarKeys
                });
            }
            if (dirtyViewKeys.length) {
                for (const viewKey of dirtyViewKeys) {
                    const view = this.editCache[viewKey] as IViewElement;
                    if (view.$isEditing) {
                        view.$editor!.writeChangeSet(changeset);
                    }
                }
            }
        }

        const children = this._srcItem.$children();
        const childrenKeys = Object.keys(children);
        for (const childkey of childrenKeys) {
            if (-1 === dirtyViewKeys.indexOf(childkey)) {
                const child = children[childkey];
                if (child.$isEditing) {
                    child.$editor!.writeChangeSet(changeset);
                }
            }
        }
    }

    // #endregion Public Methods (10)

    // #region Private Methods (3)

    private _applyChange(change: ChangeItem): void {
        const src = this._srcItem.$src;
        if (change.path === src.path) {
            if (change.op === ChangeStateEnum.updated || change.op === ChangeStateEnum.inserted) {
                this._srcItem.$assign(change.obj);
            }
        } else {
            const root = this._srcItem.$root() as IViewElement;
            const target = readPath(root, change.path) as IViewElement;
            if (target) {
                target.$edit().applyChangeSet([change]);
            }
        }
    }

    private _consoleInfo(type: Tobject<T>) {
        if (type.index && type.index.id) {
            if (typeof type.index.id === 'string') {
                return type.title + ' -> ' + readPath(this._srcItem, type.index.id);
            } else {
                return type.title + ' -> ' + readPath(this._srcItem, type.index.id[0]);
            }
        }
        return type.title;
    }

    // #endregion Private Methods (3)
}
