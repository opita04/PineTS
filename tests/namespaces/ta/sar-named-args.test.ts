import {describe,it,expect} from 'vitest';
import {PineTS} from '../../../src/PineTS.class';

// Rising bars: the first two SAR values clamp to the previous lows (99),
// then 99 + .04*(104-99) = 99.2. These fixed values follow Wilder's recurrence.
describe('SAR named parameter binding',()=>{
    it('binds named, reordered and mixed arguments and isolates calls',async()=>{
        const bars=Array.from({length:10},(_,i)=>({openTime:1704067200000+i*60000,closeTime:1704067260000+i*60000,open:100+i,high:102+i,low:99+i,close:101+i,volume:100}));
        const c=await new PineTS(bars).run(`//@version=6
indicator("SAR named arguments")
plot(ta.sar(.02,.02,.2),title="positional")
plot(ta.sar(start=.02,inc=.02,max=.2),title="named")
plot(ta.sar(max=.2,start=.02,inc=.02),title="reordered")
plot(ta.sar(.02,inc=.02,max=.2),title="mixed")
plot(ta.sar(start=.1,inc=.1,max=.5),title="different")
`);
        const values=(name:string)=>c.plots[name].data.map(x=>x.value);
        const expected=[99,99,99.2,99.548,100.06416];
        for(const name of ['positional','named','reordered','mixed']){
            const v=values(name);expect(v[0]===null||Number.isNaN(v[0])).toBe(true);
            expected.forEach((x,i)=>expect(v[i+1]).toBeCloseTo(x,8));
            expect(v).toEqual(values('positional'));
        }
        expect(values('different')[3]).toBeCloseTo(100,8);
    });
});
