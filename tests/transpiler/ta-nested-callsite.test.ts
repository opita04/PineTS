import {describe,it,expect} from 'vitest';
import {PineTS} from '../../src/PineTS.class';

// Closed-form linear regression is an independent oracle. This reproduces
// Hopper's f_ma helper, whose TA invocation is nested inside an if branch.
describe('TA state in nested helper scopes',()=>{
    it('keeps high/low and nested wrapper call paths independent',async()=>{
        const bars=Array.from({length:12},(_,i)=>({openTime:1700000000000+i*60000,closeTime:1700000060000+i*60000,open:100+i,close:100+i,high:110+i*3+(i%3),low:90-i*2-(i%2),volume:1}));
        const c=await new PineTS(bars).run(`//@version=6
indicator("nested TA state")
f(src, length) =>
    float result = na
    if length > 0
        result := ta.linreg(src, length, 0)
    result
wrapper(src, length) =>
    f(src, length)
plot(f(high, 6), "high")
plot(f(low, 6), "low")
plot(wrapper(high, 3), "nested high")
plot(wrapper(low, 3), "nested low")
`);
        const regression=(a:number[])=>{
            const n=a.length,sx=n*(n-1)/2,sxx=n*(n-1)*(2*n-1)/6;
            const slope=(n*a.reduce((s,v,i)=>s+i*v,0)-sx*a.reduce((s,v)=>s+v,0))/(n*sxx-sx*sx);
            return (a.reduce((s,v)=>s+v,0)-slope*sx)/n+slope*(n-1);
        };
        for(const [plot,key,n] of [['high','high',6],['low','low',6],['nested high','high',3],['nested low','low',3]] as const){
            for(let i=n-1;i<bars.length;i++) expect(c.plots[plot].data[i].value).toBeCloseTo(regression(bars.slice(i-n+1,i+1).map(b=>b[key])),8);
        }
    });
});
