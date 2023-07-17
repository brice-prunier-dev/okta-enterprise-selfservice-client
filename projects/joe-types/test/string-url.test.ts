import {JoeLogger} from "joe-fx";
import { t } from "../src/public_api";

describe('Joe-Types string.url ', () => {
    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it('Validate "http://engie.com"', () => {
        const urlType = t.string.url;
        const result = urlType.validate('http://engie.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.ase-ncd_infrasys16.com"', () => {
        const urlType = t.string.url;
        const result = urlType.validate('https://iamapi.ase.ncd.infrasys16.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.ase-ncd_infrasys16.com:5000"', () => {
        const urlType = t.string.url;
        const result = urlType.validate('https://iamapi.ase.ncd.infrasys16.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.com:5000/allowed-path/with10.section/"', () => {
        const urlType = t.string.url;
        const result = urlType.validate('https://iamapi.com:5000/allowed-path/with10.section/');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.com:5000/allowed-path/index.json"', () => {
        const urlType = t.string.url;
        const result = urlType.validate('https://iamapi.com:5000/allowed-path/index.json');
        expect(result.withError()).toBeFalsy();
    });


});