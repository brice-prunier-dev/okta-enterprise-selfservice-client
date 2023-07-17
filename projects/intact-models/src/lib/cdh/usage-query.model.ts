import { I } from '@angular/cdk/keycodes';
import { IViewElement, NumberPattern, ObjectDef, Objview, Tnumber, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import { ApiRefData, S_GEM_ENVS } from '../common.model';
import { CDH_TARGET, CDH_UNIT, S_CDH_TARGETYPE, S_CDH_UNITTYPE } from './usage.model';

export enum UsageFormat {
    YearOnly = 'Y',
    YearAndMonth = 'YM',
    YearMonthAndDay = 'YMD'
}
/**
 *   api, unit, year, month, day, byclient
 */
export interface UsageQueryData {
    userId: string | undefined;
    clientId: string | undefined;
    unit: CDH_UNIT;
    target: CDH_TARGET;
    year: number;
    month: number;
    day: number;
}

/**
 *   api, unit, year, month, day, byclient
 */
export const UsageQueryDef: ObjectDef<UsageQueryData> = {
    type: 'object',
    title: 'UsageQuery',
    properties: {
        userId: t.string.email,
        clientId: t.string.id,
        unit: S_CDH_UNITTYPE,
        target: S_CDH_TARGETYPE,
        year: new Tnumber({
            type: 'number',
            title: 'INT_YEAR',
            pattern: NumberPattern.INT,
            default: () => new Date().getFullYear(),
            minimum: 1,
            maximum: 2100
        }),
        month: new Tnumber({
            type: 'number',
            title: 'INT_MONTH',
            pattern: NumberPattern.INT,
            default: 0,
            minimum: 0,
            maximum: 12
        }),
        day: new Tnumber({
            type: 'number',
            title: 'INT_DAY',
            pattern: NumberPattern.INT,
            default: 1,
            minimum: 0,
            maximum: 31
        })
    },
    required: ['unit', 'target', 'year', 'month', 'day'],
    index: { id: ['target', 'unit', 'clientId', 'userId', 'year', 'month', 'day'] }
};

/**
 *   api, unit, year, month, day, byclient
 */
export const UsageQueryType: Tobject<UsageQueryData> = t.object.as<UsageQueryData>(UsageQueryDef);

export class UsageQueryView extends Objview<UsageQueryData> implements UsageQueryData {
    static equals(source: UsageQueryData, other: UsageQueryData): boolean {
        var same =
            source.target === other.target &&
            source.unit === other.unit &&
            source.year === other.year;
        if (same) {
            switch (source.target) {
                case CDH_TARGET.user:
                    same = source.userId === other.userId;
                    break;
                default:
                    same = source.clientId === other.clientId;
                    break;
            }
            if (same) {
                switch (source.unit) {
                    case CDH_UNIT.countPerMonth:
                        return same;
                    case CDH_UNIT.countPerDay:
                        return same && source.month === other.month;
                    case CDH_UNIT.countPerHour:
                    case CDH_UNIT.countPerMinute:
                        return same && source.month === other.month && source.day === other.day;
                    default:
                        return false;
                }
            }
        }
        return same;
    }

    constructor(entity?: any, parent?: IViewElement) {
        super(UsageQueryType, entity, parent);
    }
    declare userId: string | undefined;
    declare clientId: string | undefined;
    declare unit: CDH_UNIT;
    declare target: CDH_TARGET;
    declare year: number;
    declare month: number;
    declare day: number;

    getDate(): Date {
        return new Date(this.year, this.month, this.day);
    }

    getStringDate(): string {
        const yyyy = '' + this.year;
        const m = this.month + 1;
        const mm = (m < 10 ? '0' : '') + m;
        const d = this.day > 0 ? this.day : 1;
        const dd = (d < 10 ? '0' : '') + d;
        return '' + yyyy + '-' + mm + '-' + dd;
    }

    get label(): string | undefined {
        return this.target === CDH_TARGET.user ? this.userId : this.clientId;
    }
    set label(value: string | undefined) {
        switch (this.target) {
            case CDH_TARGET.user:
                this.userId === value;
                break;
            default:
                this.clientId === value;
                break;
        }
    }

    get byUsers(): boolean {
        return this.target === CDH_TARGET.clientIdByUser;
    }
    set byUsers(value: boolean) {
        if (value === true) {
            this.target = CDH_TARGET.clientIdByUser;
        } else if (this.target === CDH_TARGET.clientIdByUser) {
            this.target = CDH_TARGET.clientId;
        } else {
            this.target = CDH_TARGET.user;
        }
    }
}
UsageQueryType.viewctor = UsageQueryView;
