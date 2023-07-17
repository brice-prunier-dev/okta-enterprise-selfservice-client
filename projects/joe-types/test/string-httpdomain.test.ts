import {JoeLogger} from "joe-fx";
import { t } from "../src/public_api";

describe('Joe-Types string.httpdomain ', () => {
    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it('Validate "http://engie.com"', () => {
        const httpDomainType = t.string.httpdomain;
        const result = httpDomainType.validate('http://engie.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.ase-ncd_infrasys16.com"', () => {
        const httpDomainType = t.string.httpdomain;
        const result = httpDomainType.validate('https://iamapi.ase.ncd.infrasys16.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Validate "https://iamapi.ase-ncd_infrasys16.com:5000"', () => {
        const httpDomainType = t.string.httpdomain;
        const result = httpDomainType.validate('https://iamapi.ase.ncd.infrasys16.com');
        expect(result.withError()).toBeFalsy();
    });

    it('Reject "https://iamapi.ase.ncd.infrasys16.com:5000/not-allowed-path"', () => {
        const httpDomainType = t.string.httpdomain;
        const result = httpDomainType.validate('https://iamapi.ase.ncd.infrasys16.com:5000/not-allowed-path');
        expect(result.withError()).toBeTruthy();
    });

    it('Reject "htps://iamapi.ase.ncd.infrasys16.com:5000/', () => {
        const httpDomainType = t.string.httpdomain;
        const result = httpDomainType.validate('htps://iamapi.ase.ncd.infrasys16.com:5000/')
        expect(result.withError()).toBeTruthy();
    });


});