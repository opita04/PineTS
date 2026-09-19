// SPDX-License-Identifier: AGPL-3.0-only
import { Series } from '../../Series';

/** Unwrap scalar namespace snapshots without coercing ordinary Pine objects. */
export function comparisonValue(value: any): any {
    const scalar = Series.from(value).get(0);
    if (scalar !== null && typeof scalar === 'object' && typeof scalar[Symbol.toPrimitive] === 'function') {
        return scalar[Symbol.toPrimitive]('default');
    }
    return scalar;
}
