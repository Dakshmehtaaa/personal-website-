/* Calculations share the factors and source labels rendered in the form. */
(function (root) {
    'use strict';
    function computeInventory(activities, includeUpstream) {
        const totals = { 1: 0, 2: 0, 3: 0 }, lines = [], missing = [];
        let upstreamKg = 0;
        for (const activity of activities) {
            const quantity = Number.isFinite(activity.quantity) && activity.quantity > 0 ? activity.quantity : 0;
            if (!quantity) continue;
            if (!Number.isFinite(activity.factor) || activity.factor < 0) {
                missing.push(activity.id);
                continue;
            }
            const kg = quantity * activity.factor;
            totals[activity.scope] += kg;
            lines.push({ ...activity, quantity, kg });
            if (includeUpstream && Number.isFinite(activity.wtt) && activity.wtt >= 0) {
                const upstream = quantity * activity.wtt;
                totals[3] += upstream;
                upstreamKg += upstream;
                lines.push({ ...activity, scope: '3', name: activity.name + ' · upstream', factor: activity.wtt, kg: upstream, source: activity.wttSource });
            }
        }
        return { totals, lines, missing, upstreamKg, grand: totals[1] + totals[2] + totals[3] };
    }
    root.CarbonCore = { computeInventory };
    if (typeof module !== 'undefined' && module.exports) module.exports = root.CarbonCore;
})(typeof window !== 'undefined' ? window : globalThis);
