import { describe, expect, it } from 'vitest';
import { Context } from '../../../src/Context.class';
import { Series } from '../../../src/Series';
import { initializeStrategy, processStrategyOrders } from '../../../src/namespaces/strategy/utils';

// Independent expected prices: TradingView strategies / Broker emulator documents
// price improvement to the next open when a resting limit is crossed in a gap.
// https://www.tradingview.com/pine-script-docs/concepts/strategies/#broker-emulator
function fill(direction: number, open: number, high: number, low: number, limit: number) {
    const c: any = new Context({ marketData: [], source: [], tickerId: 'TEST', timeframe: 'D' } as any);
    c.pine = { syminfo: { pointvalue: 1, mintick: 0.01, mincontract: 1 } } as any;
    initializeStrategy(c, { initial_capital: 100000, slippage: 1 });
    c.idx = 1;
    for (const [field, value] of Object.entries({ open, high, low, close: open })) c.data[field] = new Series([value]);
    c.data.openTime = new Series([1704240000000]);
    c.strategy.pending_orders.push({ id: 'Entry', direction, qty: 1, type: 'limit', category: 'entry', limit,
        bar: 0, time: 1704153600000, status: 'pending' });
    processStrategyOrders(c);
    return c.strategy.opentrades[0]?.entry_price;
}
describe('resting entry limits receive opening gap improvement', () => {
    it('buys at a lower opening price', () => expect(fill(1, 90, 102, 89, 95)).toBe(90));
    it('sells at a higher opening price', () => expect(fill(-1, 110, 111, 99, 105)).toBe(110));
    it('retains intrabar long limit price', () => expect(fill(1, 100, 102, 94, 95)).toBe(95));
    it('retains intrabar short limit price', () => expect(fill(-1, 100, 106, 98, 105)).toBe(105));
    it('does not fill an untouched limit', () => expect(fill(1, 100, 102, 96, 95)).toBeUndefined());
});
