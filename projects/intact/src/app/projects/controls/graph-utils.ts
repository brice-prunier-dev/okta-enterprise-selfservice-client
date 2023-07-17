import {PROJECTITEM_TYPE, SCOPES_OPENID} from 'intact-models';
import {fittingString} from '../../_core';
import {sameString} from 'joe-fx';
import {NodeConfig} from '@antv/g6';

const label_offset = 3;
const vert_icon_offset = 55;
export function getG6Item(
    itemType: PROJECTITEM_TYPE,
    id: string,
    label: string,
    index: number
): NodeConfig {
    const itemLabel = fittingString(label, 300, 12);
    switch (itemType) {
        case PROJECTITEM_TYPE.group:
            return {
                id,
                x: 110,
                y: 20 + vert_icon_offset * index,
                label: sameString(label, 'b2e')
                    ? 'ENGIE'
                    : sameString(label, 'gem')
                        ? 'GEM'
                        : sameString(label, 'all')
                            ? 'Everyone'
                            : itemLabel,
                type: 'image',

                // The type of graphics shape of the node
                size: 32,
                img: sameString(label, 'b2e')
                    ? '/assets/graph-group-b2e.svg'
                    : sameString(label, 'gem')
                        ? '/assets/graph-group-gem.svg'
                        : sameString(label, 'all')
                            ? '/assets/graph-group-all.svg'
                            : '/assets/graph-group.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    stroke: sameString(label, 'b2e')
                        ? '#69af23'
                        : sameString(label, 'gem')
                            ? '#0af'
                            : sameString(label, 'all')
                                ? '#DD2C00'
                                : '#F90089',
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.group
            };
        case PROJECTITEM_TYPE.application:
            return {
                id,
                x: 350,
                y: 20 + vert_icon_offset * index,
                label: itemLabel,
                type: 'image',

                // The type of graphics shape of the node
                size: 32,
                img: '/assets/graph-app.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.application
            };

        case PROJECTITEM_TYPE.externalApp:
            return {
                id,
                x: index % 2 ? 1080 : 960,
                y:
                    index % 2
                        ? 50 + vert_icon_offset * Math.floor(index / 2)
                        : 20 + vert_icon_offset * Math.floor(index / 2),
                label: itemLabel,

                // The type of graphics shape of the node
                type: 'image',
                size: 32,
                img: '/assets/graph-app.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.externalApp
            };

        case PROJECTITEM_TYPE.scope:
            return {
                id,
                x: 550,
                y: vert_icon_offset * index,
                label: itemLabel,
                type: 'image',
                img: '/assets/graph-scope.svg',
                // The type of graphics shape of the node
                size: 28,
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.scope
            };
            break;

        case PROJECTITEM_TYPE.externalScp:
            return {
                id,
                x: 740,
                y: vert_icon_offset * index,
                label: SCOPES_OPENID.includes(label) ? label : itemLabel,
                type: 'image',
                size: 28,
                img: '/assets/graph-scope.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.externalScp
            };
            break;
    }
    throw new Error(`Invalid graph item "${itemType}"`);
}

export function getG6AppItem(
    itemType: PROJECTITEM_TYPE,
    appType: string,
    id: string,
    label: string,
    index: number
): any {
    const itemLabel = fittingString(label, 300, 12);
    switch (itemType) {
        case PROJECTITEM_TYPE.application:
            return {
                id,
                x: 350,
                y: 20 + vert_icon_offset * index,
                label: itemLabel,
                type: 'image',

                // The type of graphics shape of the node
                size: 32,
                img: '/assets/graph-app-' + (appType || 'service') + '.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.application
            };

        case PROJECTITEM_TYPE.externalApp:
            return {
                id,
                x: 1020,
                y: 20 + vert_icon_offset * index,
                label: itemLabel,

                // The type of graphics shape of the node
                type: 'image',
                size: 32,
                img: '/assets/graph-app-' + appType + '.svg',
                labelCfg: {
                    position: 'bottom',
                    offset: label_offset,
                    style: {
                        fontSize: 12,
                        fill: '#3B5C68'
                    }
                },
                style: {
                    cursor: 'pointer'
                },
                class: PROJECTITEM_TYPE.externalApp
            };
    }
}
