// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

/** Counts evaluations since the last true condition at this call site. */
export function barssince(context: any) {
    return (condition: any, _callId?: string) => {
        if (!context.taState) context.taState = {};
        const stateKey = _callId || 'barssince';
        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { lastIdx: -1, previous: NaN, current: NaN };
        }
        const state = context.taState[stateKey];
        // A conditional call has no samples on skipped bars. Commit only its
        // preceding evaluated value; repeated same-bar calls share that base.
        if (context.idx > state.lastIdx) {
            if (state.lastIdx >= 0) state.previous = state.current;
            state.lastIdx = context.idx;
        }
        state.current = Series.from(condition).get(0) ? 0 : state.previous + 1;
        return state.current;
    };
}
