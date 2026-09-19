import { describe, expect, it } from 'vitest';
import { PineTS } from '../../../src/PineTS.class';

// First retained Donchian fill: MNQ close 30573.25 on 1780284000000,
// one tick slippage gives 30573.5. Native capture is in Tradingview_Hub/
// backtests/pinets-native-parity-2026-09-14/donchian-native/native-trades.json.
const candles = [
    {openTime:1780284000000,closeTime:1780284300000,open:30570,high:30575,low:30569,close:30573.25,volume:1},
    {openTime:1780284300000,closeTime:1780284600000,open:30573.5,high:30580,low:30570,close:30579,volume:1},
];
const provider:any = {getMarketData:async()=>candles,getSymbolInfo:async()=>({tickerid:'MNQ',mintick:0.25,pointvalue:2,mincontract:1,timezone:'America/Chicago'}),configure(){}};

describe('process_orders_on_close',()=>{
    it('fills an entry and reversal on their signal closing ticks',async()=>{
        const ctx=await new PineTS(provider,'MNQ','5',2).run(`//@version=6
strategy("closing tick", process_orders_on_close=true, initial_capital=1000000, slippage=1)
if bar_index == 0
    strategy.entry("Long", strategy.long, qty=16)
if bar_index == 1
    strategy.entry("Short", strategy.short, qty=16)
`);
        expect(ctx.strategy.closedtrades).toHaveLength(1);
        expect(ctx.strategy.closedtrades[0]).toMatchObject({entry_time:1780284000000,entry_price:30573.5,exit_time:1780284300000,exit_price:30578.75,size:16});
        expect(ctx.strategy.opentrades).toHaveLength(1);
        expect(ctx.strategy.opentrades[0].entry_price).toBe(30578.75);
    });
    it('preserves next-open execution when disabled',async()=>{
        const ctx=await new PineTS(provider,'MNQ','5',2).run(`//@version=6
strategy("next open", process_orders_on_close=false, initial_capital=1000000, slippage=1)
if bar_index == 0
    strategy.entry("Long", strategy.long, qty=16)
`);
        expect(ctx.strategy.opentrades[0]).toMatchObject({entry_time:1780284300000,entry_price:30573.75});
    });
    it('fills a market close on the signal close without using its earlier high or low',async()=>{
        const ctx=await new PineTS(provider,'MNQ','5',2).run(`//@version=6
strategy("close", process_orders_on_close=true, initial_capital=1000000, slippage=1)
if bar_index == 0
    strategy.entry("Long", strategy.long, qty=16)
if bar_index == 1
    strategy.close("Long")
`);
        expect(ctx.strategy.closedtrades[0]).toMatchObject({entry_time:1780284000000,exit_time:1780284300000,exit_price:30578.75});
    });
});
