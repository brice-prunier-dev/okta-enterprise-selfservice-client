import { DateDef, DatePattern, Tdate } from 'joe-fx';

function currentDate(): Date {
    return new Date();
}
export const DATE_TODAY: DateDef = {
    type: 'date',
    title: 'D_DATE_TODAY',
    pattern: DatePattern.DATE,
    default: currentDate
};

export const DATE: DateDef = {
    type: 'date',
    title: 'D_DATE',
    pattern: DatePattern.DATE
};

export const DATETIME_NOW: DateDef = {
    type: 'date',
    title: 'D_DATETIME_NOW',
    pattern: DatePattern.DATETIME,
    default: currentDate
};

export const DATETIME: DateDef = {
    type: 'date',
    title: 'D_DATETIME',
    pattern: DatePattern.DATETIME
};