import {describe,it,expect} from 'vitest';
import {PineTS} from '../../src/PineTS.class';

describe('implicit tuple declaration return',()=>{
    it('returns final declaration values, including nested branches and discarded bindings',async()=>{
        const bars=Array.from({length:4},(_,i)=>({openTime:1704067200000+i*60000,closeTime:1704067260000+i*60000,open:100+i,high:102+i,low:99+i,close:101+i,volume:100}));
        const c=await new PineTS(bars).run(`//@version=6
indicator("tuple declaration")
pair() =>
    [close,high]
f() =>
    [a,b]=pair()
g() =>
    if close>102
        [a,b]=pair()
    else
        [a,b]=pair()
discard() =>
    [_,_]=pair()
[x,y]=f()
[u,v]=g()
[d,e]=discard()
plot(x,title="x")
plot(y,title="y")
plot(u,title="u")
plot(v,title="v")
plot(d,title="d")
plot(e,title="e")
`);
        for(const name of ['x','u','d'])expect(c.plots[name].data.map(x=>x.value)).toEqual(bars.map(x=>x.close));
        for(const name of ['y','v','e'])expect(c.plots[name].data.map(x=>x.value)).toEqual(bars.map(x=>x.high));
    });
});
