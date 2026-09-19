import { describe, expect, it } from 'vitest';
import { pivothigh } from '../../../src/namespaces/ta/utils/pivothigh';
import { pivotlow } from '../../../src/namespaces/ta/utils/pivotlow';

// Retained AlgoAlpha native Pivot entries on MNQ 5m: short confirmed at
// 1784131500000 and long at 1787121300000. Both require accepting an
// equal older extreme and selecting the later point of the plateau.
describe('confirmed pivots with equal older extremes',()=>{
    it('accepts the later high in the captured double-top window',()=>{
        const highs=[29611.25,29609.5,29642.75,29656.25,29652.75,29656.25,29618.25,29598,29590,29600,29535.75];
        expect(pivothigh(highs,5,5).at(-1)).toBe(29656.25);
        highs[7]=29656.25;
        expect(pivothigh(highs,5,5).at(-1)).toBeNaN();
    });
    it('accepts the later low in the captured double-bottom window',()=>{
        const lows=[29460.75,29452.25,29446.75,29444.25,29430.25,29430.25,29434.75,29477,29472.25,29472.75,29475.5];
        expect(pivotlow(lows,5,5).at(-1)).toBe(29430.25);
        lows[7]=29430.25;
        expect(pivotlow(lows,5,5).at(-1)).toBeNaN();
    });
});
