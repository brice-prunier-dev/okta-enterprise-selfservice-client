import { decodeSelector, JoeLogger } from '../src';

describe('Joe-Fx Core', () => {

    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it('Decode "#12, tyty, ##1.23" should return [12, "tyty", 1.23]', () => {
        const selectorValues = decodeSelector('#12, tyty, ##1.23');
        expect(Array.isArray( selectorValues)).toBeTruthy();
        const selectorArray = selectorValues as (string | number)[];
        expect(selectorArray[0]).toBe(12);
        expect(selectorArray[1]).toBe('tyty');
        expect(selectorArray[2]).toBe(1.23);
    });
});