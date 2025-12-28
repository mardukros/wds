/**
 * Simple tests for supply chain implementation
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  createExampleSupplyChain,
  exampleQueryActorsByType,
  exampleFindSupplyChainPath,
  exampleQueryByCooperative,
} from '../dist/example.js';

test('createExampleSupplyChain creates a valid supply chain', () => {
  const lookup = createExampleSupplyChain();
  assert.ok(lookup, 'Lookup should be created');
});

test('exampleQueryActorsByType finds actors', async () => {
  const result = await exampleQueryActorsByType();
  assert.ok(result.suppliers, 'Should find suppliers');
  assert.ok(result.producers, 'Should find producers');
  assert.strictEqual(result.suppliers.items.length, 2, 'Should find 2 suppliers');
  assert.strictEqual(result.producers.items.length, 1, 'Should find 1 producer');
});

test('exampleFindSupplyChainPath finds path from supplier to retailer', async () => {
  const path = await exampleFindSupplyChainPath();
  assert.ok(Array.isArray(path), 'Path should be an array');
  assert.ok(path.length > 0, 'Path should not be empty');
  assert.strictEqual(path[0], 's1', 'Path should start at s1');
  assert.strictEqual(path[path.length - 1], 'r1', 'Path should end at r1');
});

test('exampleQueryByCooperative finds cooperative members', async () => {
  const result = await exampleQueryByCooperative();
  assert.ok(result.items, 'Should have items');
  assert.ok(result.items.length > 0, 'Should find at least one member');
});

test('lookup can find actors by type', async () => {
  const lookup = createExampleSupplyChain();
  const suppliers = await lookup.findActors({ type: 'supplier' });
  assert.strictEqual(suppliers.total, 2, 'Should find 2 suppliers');
  assert.ok(suppliers.items[0].name, 'Supplier should have a name');
});

test('lookup can find actors by name', async () => {
  const lookup = createExampleSupplyChain();
  const result = await lookup.findActors({ name: 'Manufacturing' });
  assert.ok(result.total > 0, 'Should find actors with matching name');
});

test('lookup can find actors by capacity', async () => {
  const lookup = createExampleSupplyChain();
  const result = await lookup.findActors({ 
    capacityType: 'storage', 
    minCapacity: 10000 
  });
  assert.ok(result.total > 0, 'Should find actors with sufficient capacity');
});

test('lookup can get actor by ID', async () => {
  const lookup = createExampleSupplyChain();
  const actor = await lookup.getActorById('s1');
  assert.ok(actor, 'Should find actor by ID');
  assert.strictEqual(actor.id, 's1', 'Actor ID should match');
  assert.strictEqual(actor.type, 'supplier', 'Actor should be a supplier');
});

test('lookup can find products', async () => {
  const lookup = createExampleSupplyChain();
  const products = await lookup.findProducts({ category: 'finished_good' });
  assert.ok(products.total > 0, 'Should find products');
  assert.strictEqual(products.items[0].category, 'finished_good', 'Product should be finished good');
});

test('pagination works correctly', async () => {
  const lookup = createExampleSupplyChain();
  const page1 = await lookup.findActors({}, 1, 1);
  assert.strictEqual(page1.page, 1, 'Page should be 1');
  assert.strictEqual(page1.pageSize, 1, 'Page size should be 1');
  assert.ok(page1.hasMore, 'Should have more pages');
  
  const page2 = await lookup.findActors({}, 2, 1);
  assert.strictEqual(page2.page, 2, 'Page should be 2');
});
