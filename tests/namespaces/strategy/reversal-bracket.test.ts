import { describe, expect, it } from 'vitest';
import { Context } from '../../../src/Context.class';
import { Series } from '../../../src/Series';
import { initializeStrategy, openTrade, processExitOrders } from '../../../src/namespaces/strategy/utils';

describe('absolute brackets attached to reversal entries', () => {
    it('retains the captured MNQ target after a sparse reversal signal', () => {
        // Native Breakout trade 8: entry 29204.75, target 29235.5, one MNQ.
        // On the exit bar O/H/L/C = 29232/29236.25/29224.5/29233.
        // The bracket was submitted with the reversal on bar 4845. Its
        // prices came from close, not the outgoing position average.
        const c: any = new Context({ marketData: [], source: [], tickerId: 'MNQ', timeframe: '30S' } as any);
        c.pine = { syminfo: { pointvalue: 2, mintick: 0.25, mincontract: 1 } } as any;
        initializeStrategy(c, { initial_capital: 10000, slippage: 1,
            commission_type: 'cash_per_contract', commission_value: 2.5 });
        c.idx = 4846;
        for (const field of ['open', 'high', 'low', 'close']) c.data[field] = new Series([29204.75]);
        c.data.openTime = new Series([1788276180000]);
        openTrade(c, 'Long', 1, 1, 29204.75, 1788276180000);
        c.strategy.pending_orders.push({ id: 'Long Exit', from_entry: 'Long', direction: 0,
            qty: 0, type: 'market', category: 'exit', limit: 29235.5, stop: 29190.5,
            bar: 4845, time: 1788276150000, status: 'pending',
            _attachedAtReversal: true, _isPersistent: false });
        c.idx = 4860;
        for (const [field, value] of Object.entries({ open: 29232, high: 29236.25, low: 29224.5, close: 29233 })) {
            c.data[field] = new Series([value]);
        }
        c.data.openTime = new Series([1788276600000]);
        processExitOrders(c);
        expect(c.strategy.closedtrades).toHaveLength(1);
        expect(c.strategy.closedtrades[0].exit_price).toBe(29235.5);
        expect(c.strategy.closedtrades[0].exit_time).toBe(1788276600000);
        expect(c.strategy.closedtrades[0].profit).toBe(56.5);
    });
});
