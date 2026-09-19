# Absolute exits after reversal entries

A captured native MNQ 30-second Breakout run exposed a false suppression rule in `processExitOrders`. The engine discarded absolute stop and limit legs when an exit was attached to a reversal entry and its callsite had not run on the prior bar. Neither fact proves that the supplied price is invalid or derived from the outgoing position.

At signal bar 4845, the unchanged strategy submitted a long reversal with stop 29190.5 and target 29235.5, calculated from close 29205.5. The long filled at 29204.75 on bar 4846. On bar 4860, the captured OHLC was 29232 / 29236.25 / 29224.5 / 29233. TradingView filled the target at 29235.5; PineTS suppressed it and later closed on an opposite signal. Native net was 56.5 after 5 in commission for one MNQ contract.

The fix removes the reversal-based suppression and its unused attachment flag. The existing wrong-sided-price cadence guard is unchanged and has not been established as generally correct by this work.

`tests/namespaces/strategy/reversal-bracket.test.ts` isolates the captured exit-bar case. Before the fix it closes zero trades instead of one. After the fix it matches the captured exit price, time and net profit. The full original strategy is replayed separately against retained native source, inputs and candles in the TradingView Hub. Those private captures are not embedded in this repository.

This validation uses historical captures. It does not establish fresh Desktop verification, universal Pine compatibility or live execution equivalence.
