import {describe,it,expect} from 'vitest';
import {barssince} from '../../../src/namespaces/ta/methods/barssince';

// Pine's conditional functions retain history only when evaluated. See the
// v5 execution-model docs, Historical values of functions. The retained Hopper
// ledger excludes two signals where conditional counts are 3 and 6, not elapsed
// global-bar distances 38 and 124.
describe('barssince conditional execution history',()=>{
    it('counts evaluations since true, preserving same-bar rollback',()=>{
        const context:any={idx:0,taState:{}};const since=barssince(context);
        expect(since(false,'sparse')).toBeNaN();
        context.idx=2;expect(since(true,'sparse')).toBe(0);
        context.idx=10;expect(since(false,'sparse')).toBe(1);
        expect(since(false,'sparse')).toBe(1);
        context.idx=20;expect(since(false,'sparse')).toBe(2);
        expect(since(true,'sparse')).toBe(0);
        expect(since(false,'sparse')).toBe(2);
        context.idx=40;expect(since(false,'sparse')).toBe(3);
    });
});
