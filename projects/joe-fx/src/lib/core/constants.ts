
/**
 * Value assigned to a new child element as temporary path.
 * 
 * A ViewElement having __PATH_UNASSIGNED__ for _path_ value is not part of the document view hierarchy. 
 * A new child element received its _path_ value only when it is added to the document view hierarchy. 
 * 
 */
export const PATH_UNASSIGNED = '_?_';
/**
 * Sympbol used in __JOE__ Json path.
 * 
 * '_$_' reference the root element of a document view hierarchy.
 */
export const PATH_ROOT = '$';
/**
 * Sympbol used in __JOE__ Json path.
 * 
 * '_._' reference the current element where the __JOE__ Json path shoult be applied                                                           .
 */
export const PATH_LOCAL = '.';
/**
 * Sympbol used in __JOE__ Json path.
 * 
 * 'It references the parent element of the instance where a __JOE__ Json path shoult be applied                                                           .
 */
export const PATH_PARENT = '<';
/**
 * Sympbol used in __JOE__ Json path as child separator.
 *                                                            .
 */
export const PATH_NEXT = '>';
/**
 * Sympbol used as Key/Value separator.
 * 
 * Example: key:value                                                            .
 */

export const KEYVALUE_SEPARATOR = ':';
/**
 * Sympbol used as multiple Key/Value separator.
 * 
 * Example: key1:value1, key2:value2                                                            .
 */
export const KEYVALUEPAIR_SEPARATOR = ',';
/**
 * Constant for quote.
 */
export const QUOTE = "'";
/**
 * Constant for double quote.
 */
export const DOUBLEQUOTE = '"';
/**
 * Sympbol used as numeric prefix.
 * 
 * __JOE__ Json path doesn't use ' or ": all values are strings by default.
 * To specify a numeric value it should be prefixed by a #.
 * Example: #10                                                            .
 */
export const NUMERIC_PREFIX = '#';

/**
 * #
 */
export const REFRESH_DATAPATH = '**/*';

/**
 * Specify the domain relative to a message
 */
export let MessageDomain = {
    ALL: 'ALL',
    AUTH: 'authentication',
    DATA: 'data',
    FX: 'fx',
    PROCESS: 'debug-process',
    UI: 'debug-ui',
    EXCEPTION: 'exception',
    RUNTIME: 'runtime',
    VALIDATION: 'validation'
};
