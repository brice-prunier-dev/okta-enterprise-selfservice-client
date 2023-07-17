import {JoeLogger} from "joe-fx";
import {t} from "../src/public_api";

describe('Joe-Types t.string.datetime_iso', () => {
    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it('Validate "2020-01-01T01:01:01"', () => {
        const isoType = t.string.datetime_iso;
        const result = isoType.validate('2020-01-01T01:01:01');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate iso "2021-06-17T16:57:54.6486911+02:00"', () => {
        const isoType = t.string.datetime_iso;
        const result = isoType.validate('2021-06-17T16:57:54.6486911+02:00');
        expect(result.withError()).toBeFalsy();
    });

    it('Reject "2020-01-01T35:01:01"', () => {
        const isoType = t.string.datetime_iso;
        const result = isoType.validate('2020-01-01T35:01:01');
        expect(result.withError()).toBeTruthy();
    });

    it('Reject "2019-12-05 11:29:51"', () => {
        const isoType = t.string.datetime_iso2;
        const result = isoType.validate('2019-12-05 11:29:51');
        expect(result.withError()).toBeTruthy();
    });

    it('Validate iso2 "2019-12-05 11:29:51Z"', () => {
        const isoType2 = t.string.datetime_iso2;
        const result = isoType2.validate('2019-12-05 11:29:51Z');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate iso2 "2019-12-05 11:29:51.140Z"', () => {
        const isoType2 = t.string.datetime_iso2;
        const result = isoType2.validate('2019-12-05 11:29:51.145Z');
        expect(result.withError()).toBeFalsy();
    });

    it('Reject iso2 "2019-52-05 11:29:51.145Z"', () => {
        const isoType2 = t.string.datetime_iso2;
        const result = isoType2.validate('2019-52-05 11:29:51.145Z');
        expect(result.withError()).toBeTruthy();
    });






});