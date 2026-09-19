import { describe, expect, it } from 'vitest';
import { Context } from '../../../src/Context.class';
import { Series } from '../../../src/Series';
import { PineTS } from '../../../src/PineTS.class';
import { initializeStrategy, openTrade, processMarginCall } from '../../../src/namespaces/strategy/utils';

// Retained native Donchian capture in Tradingview_Hub/backtests/
// pinets-native-parity-2026-09-14/donchian-native, trades 28 and 54.
describe('contract-sized margin calls and reversal funding', () => {
    it('liquidates a minimum MNQ contract with closing-direction slippage', () => {
        const c:any = new Context({marketData:[],source:[],tickerId:'MNQ',timeframe:'5'} as any);
        c.pine={syminfo:{pointvalue:2,mintick:0.25,mincontract:1}} as any;
        initializeStrategy(c,{initial_capital:1002378.8068,margin_short:100,slippage:1,commission_type:'percent',commission_value:0.01});
        c.idx=2662;
        for(const field of ['open','high','low','close']) c.data[field]=new Series([29420.25]);
        c.data.openTime=new Series([1781268600000]);
        openTrade(c,'Short',-1,17,29420.25,1781268600000);
        c.idx=2666;
        for(const [field,value] of Object.entries({open:29443,high:29458.75,low:29423.5,close:29456})) c.data[field]=new Series([value]);
        c.data.openTime=new Series([1781269800000]);
        processMarginCall(c,'extreme');
        expect(c.strategy.closedtrades).toHaveLength(1);
        expect(c.strategy.closedtrades[0]).toMatchObject({size:-1,entry_price:29420.25,exit_price:29459,exit_time:1781269800000});
        expect(c.strategy.closedtrades[0].profit).toBeCloseTo(-89.27585,8);
        expect(c.strategy.position_size).toBe(-16);
    });
    it('sizes a percent-equity reversal after its outgoing execution costs', async()=>{
        const candles=[
            {openTime:1782411900000,closeTime:1782412200000,open:29877.25,high:29878,low:29876,close:29877.25,volume:1},
            {openTime:1782437400000,closeTime:1782437700000,open:29556,high:29560,low:29550,close:29554.75,volume:1},
        ];
        const provider:any={getMarketData:async()=>candles,getSymbolInfo:async()=>({tickerid:'MNQ',mintick:0.25,pointvalue:2,mincontract:1,timezone:'America/Chicago'}),configure(){}};
        const ctx=await new PineTS(provider,'MNQ','5',2).run(`//@version=6
strategy("reversal funds",process_orders_on_close=true,initial_capital=1015996.06529,default_qty_type=strategy.percent_of_equity,default_qty_value=100,commission_type=strategy.commission.percent,commission_value=0.01,slippage=1)
if bar_index == 0
    strategy.entry("Long",strategy.long,qty=17)
if bar_index == 1
    strategy.entry("Short",strategy.short)
`);
        expect(ctx.strategy.opentrades).toHaveLength(1);
        expect(ctx.strategy.opentrades[0]).toMatchObject({size:-16,entry_price:29554.5});
    });
});
