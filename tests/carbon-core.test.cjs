const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { computeInventory } = require('../js/carbon-core.js');
const markup = readFileSync(join(__dirname, '../co2-tracker.html'), 'utf8');
const inputs = [...markup.matchAll(/<input\b[^>]*>/g)].map(match =>
    Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(attribute => [attribute[1], attribute[2]]))
);
const activity = (id, quantity, overrides = {}) => {
    const input = inputs.find(input => input.id === id);
    assert.ok(input, `Missing calculator input: ${id}`);
    return { id, quantity, scope: input['data-scope'], factor: parseFloat(input['data-factor']),
        wtt: parseFloat(input['data-wtt']), name: id, unit: input['data-unit'],
        source: input['data-source'], wttSource: input['data-wtt-source'], ...overrides };
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('gas combustion and upstream fuel are allocated and exported separately', () => {
    const result = computeInventory([activity('s1-gas', 10000)], true);
    near(result.totals[1], 1823.1);
    near(result.totals[3], 302.1);
    near(result.grand, 2125.2);
    assert.equal(result.lines.length, 2);
    near(result.lines[1].factor, 0.03021);
    assert.equal(result.lines[1].quantity, 10000);
    assert.match(result.lines[1].source, /11_100_1004_6_1/);
});

test('different fuels use their own upstream factors; unselected upstream stays excluded', () => {
    const activities = [activity('s1-oil', 100), activity('s1-diesel', 100)];
    const result = computeInventory(activities, true);
    near(result.totals[1], 512.37);
    near(result.upstreamKg, 114.179);
    near(computeInventory(activities, false).totals[3], 0);
});

test('travel uses passenger distance and hotel room-nights without a second flight uplift', () => {
    near(computeInventory([activity('s3-air-long', 1000), activity('s3-hotel', 2)], true).grand, 82.66);
});

test('positive activity without grid or spend factors is flagged instead of silently zeroed', () => {
    const result = computeInventory([activity('s2-elec', 1000), activity('s3-it', 100)], false);
    assert.deepEqual(result.missing, ['s2-elec', 's3-it']);
    assert.equal(result.lines.length, 0);
});

test('explicit zero factors remain valid and retain an auditable activity line', () => {
    const result = computeInventory([activity('s2-elec', 1000, { factor: 0, source: 'Published grid factor · 2026' })], false);
    assert.equal(result.missing.length, 0);
    assert.equal(result.lines.length, 1);
    assert.equal(result.grand, 0);
});

test('blank, negative and non-finite activity are excluded; invalid positive-activity factors are flagged', () => {
    assert.deepEqual(computeInventory([activity('s2-elec', 0), activity('s1-gas', -1), activity('s1-oil', NaN)], true).lines, []);
    assert.deepEqual(computeInventory([activity('s2-elec', 10, { factor: -1 })], false).missing, ['s2-elec']);
});

test('refrigerant and water factors preserve their units', () => {
    near(computeInventory([activity('s1-refrig', 1)], true).totals[1], 1924);
    near(computeInventory([activity('s3-water', 100)], false).totals[3], 36.218);
});

test('form factors match the checked source-row audit', () => {
    const audit = JSON.parse(readFileSync(join(__dirname, '../reference/factor-audit-2026.json'), 'utf8'));
    for (const row of audit.selected_rows) near(activity(row.input, 1).factor, row.factor);
});
