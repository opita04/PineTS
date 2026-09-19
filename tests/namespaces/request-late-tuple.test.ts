import {describe,it,expect} from 'vitest';
import {PineTS} from '../../src/PineTS.class';
const bars=(offset:number)=>Array.from({length:8},(_,i)=>({openTime:1704067200000+i*300000,closeTime:1704067500000+i*300000,open:offset+i,high:offset+i+2,low:offset+i-1,close:offset+i+1,volume:100}));
const provider:any={getMarketData:async(s:string)=>bars(s==='AAA'?100:200),getSymbolInfo:async()=>({tickerid:'AAA',mintick:.01,timezone:'UTC',type:'stock'}),configure(){}};
describe('late-created request expression history',()=>{
 it('aligns a conditional different-symbol tuple with actual secondary bar indices',async()=>{
 const c=await new PineTS(provider,'AAA','5',8).run(`//@version=6
indicator("late request")
float a=na
float b=na
if bar_index>=5
    [x,y]=request.security("BBB","5",[close,high])
    a:=x
    b:=y
plot(a,title="a")
plot(b,title="b")
`);
 expect(c.plots.a.data.slice(5).map(x=>x.value)).toEqual([206,207,208]);
 expect(c.plots.b.data.slice(5).map(x=>x.value)).toEqual([207,208,209]);
 });
 it('does not unpack a truncated helper return inside the secondary slice',async()=>{
 const c=await new PineTS(provider,'AAA','5',8).run(`//@version=6
indicator("late helper")
f(sym) =>
    [x,y]=request.security(sym,"5",[close,high])
    [x,y]
float a=na
float b=na
if bar_index>=5
    [x,y]=f("BBB")
    a:=x
    b:=y
plot(a,title="a")
plot(b,title="b")
`);
 expect(c.plots.a.data.slice(5).map(x=>x.value)).toEqual([206,207,208]);
 expect(c.plots.b.data.slice(5).map(x=>x.value)).toEqual([207,208,209]);
 });
 it('falls back safely for multiple helper call sites and loop progress',async()=>{
 const c=await new PineTS(provider,'AAA','5',8).run(`//@version=6
indicator("request callers")
f(sym) =>
    [x,y]=request.security(sym,"5",[close,high])
    [x,y]
float a=na
float b=na
if bar_index>=5
    [x,y]=f("BBB")
    [u,v]=f("CCC")
    a:=x+u
    int i=0
    while i<1
        [m,n]=f("DDD")
        b:=n
        i+=1
plot(a,title="a")
plot(b,title="b")
`);
 expect(c.plots.a.data.slice(5).map(x=>x.value)).toEqual([412,414,416]);
 expect(c.plots.b.data.slice(5).map(x=>x.value)).toEqual([207,208,209]);
 });

 it('preserves a single helper caller loop increment in the full-script fallback',async()=>{
 const c=await new PineTS(provider,'AAA','5',8).run(`//@version=6
indicator("loop caller")
f(sym) =>
    [x,y]=request.security(sym,"5",[close,high])
    [x,y]
float a=na
int i=0
while i<1
    [x,y]=f("BBB")
    a:=x
    i+=1
plot(a,title="a")
`);
 expect(c.plots.a.data.map(x=>x.value)).toEqual([201,202,203,204,205,206,207,208]);
 });

 it('preserves loop progress inside a helper containing the request',async()=>{
 const c=await new PineTS(provider,'AAA','5',8).run(`//@version=6
indicator("helper loop")
f(sym) =>
    float a=na
    float b=na
    int i=0
    while i<1
        [x,y]=request.security(sym,"5",[close,high])
        a:=x
        b:=y
        i+=1
    [a,b]
[x,y]=f("BBB")
plot(x,title="x")
`);
 expect(c.plots.x.data.map(x=>x.value)).toEqual([201,202,203,204,205,206,207,208]);
 });

});
