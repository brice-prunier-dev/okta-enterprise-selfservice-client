/**
 * Json typology enumeration.
 * @enum
*/
export enum PropertyTypology {
    Scalar,
    Object,
    List,
    Tuple,
    Map
}

/**
 * When a Joe Path's part typology.
 * An Joe Path is compose of 'parts' with '->' as sperator.
 * When a path is splited into path parts, it qualifies the part.
 * * @enum
 */
export enum PathIndicator {
    /**
     * Format: '[x]' with x as an index (integer).
     */
    ArrayIndex,
    /**
     * Format: '(#45)' or '(Xxx)' or '(Xxx, #45)'.
     * Having a value surrount by () means the parent part is an array and we are targeting a child item by its index.   
     * (#x): path part targeting the child item having 'x' as integer index value: # indicates the rest of the value is an integer.
     * (Xxx): indicates we are targeting the child item having 'Xxx' as string index value.
     * (Xxx, #45) indicates we are targeting the child item having the following composite index: string Xxx and integer x.
     */
    ArrayIdSelector,
    /**
     * Format: '{key: Xxx}'.
     * Having a value surrount by {} means the parent part is an array and we are targeting a child item having the following property.ies.   
     * {key: Xxx} indicates we are targeting the child item having a property named 'key' with the value Xxx.
     */
    ArrayObjectSelector,
    /**
     * @: starting symbol indicating we are starting from the curent instance element.
     */
    Local,
    /**
     * the content of the part is a property name.
     */
    Property,
    /**
     * $: starting symbol indicating we are starting from root of the current hierarchy instance.
     */
    Root,
    /**
     * <$: starting symbol indicating we are starting from the parrent of curent instance element.
     */
    ToParent
}

/**
 * Message typology
 * * @enum
 */
export enum MessageTypology {
    Error,
    Warning,
    Info,
    Trace,
    Debug,
    DebugData
}

/**
 * Editing state
 * * @enum
 */
export enum ChangeStateEnum {
    none = 'none',
    inserted = 'new',
    deleted = 'del',
    updated = 'upd'
}

/**
 * Data action used in a {@link types#DataPayload | Payload interface}.
 * * @enum
 */
export enum DataAction {
    Sync = 'sync',
    Loaded = 'loaded',
    Init = 'init',
    Wait = 'wait',
    Break = 'break',
    Complete = 'complete',
    Execute = 'exec',
    Updated = 'updated',
    Added = 'add',
    Removed = 'remove',
    Clear = 'clear',
    Modified = 'modify',
    Pause = 'pause',
    Reset = 'reset',
    ErrorRaised = 'error',
    Released = 'release',
    Validation = 'validation'
}

/**
 * ValidationScopes rules document element validation process.
 * * @enum
 */
export enum ValidationScopes {
    /**
     * Validation constant parameter.
     * 
     * Run initial state validation.
     * 
     * @remarks
     * _ValidationScope.State_ ensure that validation is ran only once.
     * 
     * Only __Property__, __AddChild__ or __RemoveChild__ can alter initial state validation.
     * 
     * Trigerring multiple validation with _ValidationScope.State_ will not compute useless validation.
     */
    State = 'State',
    /**
     * Validation constant parameter.
     * 
     * Enforce a new state validation calculation even initial validation has been ran.
     * 
     * @remarks
     * Used on Editor.CancelEdit.
     */
    EnforceState = 'EnforceState',
    /**
     * Validation constant parameter.
     * 
     * Alter current validation state on a specific property.
     * 
     */
    Property = 'Property',
    /**
     * Validation constant parameter.
     * 
     * Alter the current validation state of a collection due to a new item.
     * 
     * @remarks
     * Using _ValidationScope.AddChild_ implies an other validation parameter that is the added item: __scopeRef__.
     */
    AddChild = 'Add',
    /**
     * Validation constant parameter.
     * 
     * Alter the current validation state of a collection after an item removal.
     * 
     * @remarks
     * Using _ValidationScope.RemoveChild_ implies an other validation parameter that is the removed item: __scopeRef__.
     */
    RemoveChild = 'Remove',
    /**
     * Validation constant parameter.
     * 
     * Alter the current validation state of an element having rules to compute.
     * 
     * @remarks
     * _ValidationScope.Rule_ is applied only on valid state.
     */
    Rule = 'Rule'
}
