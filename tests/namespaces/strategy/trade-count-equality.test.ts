import { describe, expect, it } from 'vitest';
import { PineTS } from '../../../src/PineTS.class';
import { __eq } from '../../../src/namespaces/math/methods/__eq';
import { __neq } from '../../../src/namespaces/math/methods/__neq';

// Native Hopper/TopBottom use opentrades == 0; Pivot compares closedtrades
// to its previous snapshot. Counts are scalars even though the runtime
// object also exposes per-trade methods.
describe('trade-count scalar equality',()=>{
    it('allows a flat-position entry and nonflat market close',async()=>{
        const bars=Array.from({length:3},(_,i)=>({openTime:1700000000000+i*60000,closeTime:1700000060000+i*60000,open:100,high:101,low:99,close:100,volume:1}));
        const provider:any={getMarketData:async()=>bars,getSymbolInfo:async()=>({tickerid:'TEST',mintick:1,pointvalue:1,mincontract:1}),configure(){}};
        const ctx=await new PineTS(provider,'TEST','1',3).run(`//@version=6
strategy("trade counts")
if strategy.opentrades == 0 and bar_index == 0
    strategy.entry("L",strategy.long)
if strategy.opentrades != 0
    strategy.close("L")
`);
        expect(ctx.strategy.closedtrades).toHaveLength(1);
        expect(ctx.strategy.opentrades).toHaveLength(0);
    });
    it('blocks reentry on the bar that increments the closed count',async()=>{
        const bars=Array.from({length:5},(_,i)=>({openTime:1700000000000+i*60000,closeTime:1700000060000+i*60000,open:100,high:101,low:99,close:100,volume:1}));
        const provider:any={getMarketData:async()=>bars,getSymbolInfo:async()=>({tickerid:'TEST',mintick:1,pointvalue:1,mincontract:1}),configure(){}};
        const ctx=await new PineTS(provider,'TEST','1',5).run(`//@version=6
strategy("closed count history")
if strategy.opentrades == 0 and strategy.closedtrades == nz(strategy.closedtrades[1])
    strategy.entry("L",strategy.long)
if strategy.opentrades != 0
    strategy.close("L")
`);
        expect(ctx.strategy.closedtrades).toHaveLength(1);
        expect(ctx.strategy.opentrades).toHaveLength(1);
        expect(ctx.strategy.opentrades[0].entry_time).toBe(1700000240000);
    });
    it('compares scalar snapshots by value and ordinary objects by identity',()=>{
        const eq=__eq({});const neq=__neq({});
        const count=()=>({[Symbol.toPrimitive]:()=>0});
        expect(eq(count(),count())).toBe(true);
        expect(eq(count(),0)).toBe(true);
        expect(neq(count(),0)).toBe(false);
        expect(eq(count(),NaN)).toBeNaN();
        const object={value:0};
        expect(eq(object,object)).toBe(true);
        expect(eq(object,{value:0})).toBe(false);
    });
});
