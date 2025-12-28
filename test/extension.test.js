/**
 * Tests for workerd extension modules
 * These tests validate the JavaScript modules used in the supply chain extension
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the sample data
const actorsData = JSON.parse(
  readFileSync(join(__dirname, '../ext/workerd-ext/actors.json'), 'utf-8')
);
const relationshipsData = JSON.parse(
  readFileSync(join(__dirname, '../ext/workerd-ext/relationships.json'), 'utf-8')
);

// Inline the actor creation logic for testing (since we can't import the internal modules directly)
function createActor(data) {
  if (!data.id || !data.name || !data.type) {
    throw new Error('Actor must have id, name, and type');
  }

  const actor = {
    id: data.id,
    name: data.name,
    type: data.type,
    capacities: data.capacities || [],
    pricingRules: data.pricingRules || [],
    cooperativeMemberships: data.cooperativeMemberships || [],
  };

  switch (data.type) {
    case 'supplier':
      actor.rawMaterialTypes = data.rawMaterialTypes || [];
      break;
    case 'producer':
      actor.productionCapacity = data.productionCapacity || 0;
      actor.productTypes = data.productTypes || [];
      break;
    case 'distributor':
      actor.coverageArea = data.coverageArea || [];
      actor.transportCapacity = data.transportCapacity || 0;
      break;
    case 'wholesaler':
      actor.warehouseCapacity = data.warehouseCapacity || 0;
      actor.minimumOrderQuantity = data.minimumOrderQuantity || 0;
      break;
    case 'retailer':
      actor.storefront = data.storefront || 'physical';
      actor.serviceArea = data.serviceArea || [];
      break;
    case 'marketplace':
      actor.platform = data.platform || '';
      actor.commission = data.commission || 0;
      actor.vendorCount = data.vendorCount || 0;
      break;
    default:
      throw new Error(`Unknown actor type: ${data.type}`);
  }

  return actor;
}

function createLookupService(actors, relationships) {
  return {
    queryActors(query) {
      let results = Array.from(actors.values());

      if (query.type) {
        results = results.filter(actor => actor.type === query.type);
      }

      if (query.name) {
        const lowerName = query.name.toLowerCase();
        results = results.filter(actor => 
          actor.name.toLowerCase().includes(lowerName)
        );
      }

      if (query.cooperativeId) {
        results = results.filter(actor =>
          actor.cooperativeMemberships.some(
            m => m.cooperativeId === query.cooperativeId
          )
        );
      }

      if (query.capacityType && query.minCapacity !== undefined) {
        results = results.filter(actor =>
          actor.capacities.some(
            c => c.type === query.capacityType && c.value >= query.minCapacity
          )
        );
      }

      return results;
    },

    findPath(fromId, toId) {
      const visited = new Set();
      const queue = [{ actorId: fromId, path: [fromId] }];

      while (queue.length > 0) {
        const { actorId, path } = queue.shift();

        if (actorId === toId) {
          return path;
        }

        if (visited.has(actorId)) {
          continue;
        }

        visited.add(actorId);

        const outgoingRels = Array.from(relationships.values()).filter(
          rel => rel.fromActorId === actorId && rel.status === 'active'
        );

        for (const rel of outgoingRels) {
          if (!visited.has(rel.toActorId)) {
            queue.push({
              actorId: rel.toActorId,
              path: [...path, rel.toActorId],
            });
          }
        }
      }

      return [];
    },
  };
}

test('actors.json contains valid actor data', () => {
  assert.ok(Array.isArray(actorsData), 'actors.json should contain an array');
  assert.ok(actorsData.length > 0, 'actors.json should not be empty');
  
  // Verify first actor has required fields
  const firstActor = actorsData[0];
  assert.ok(firstActor.id, 'Actor should have id');
  assert.ok(firstActor.name, 'Actor should have name');
  assert.ok(firstActor.type, 'Actor should have type');
});

test('relationships.json contains valid relationship data', () => {
  assert.ok(Array.isArray(relationshipsData), 'relationships.json should contain an array');
  assert.ok(relationshipsData.length > 0, 'relationships.json should not be empty');
  
  // Verify first relationship has required fields
  const firstRel = relationshipsData[0];
  assert.ok(firstRel.id, 'Relationship should have id');
  assert.ok(firstRel.fromActorId, 'Relationship should have fromActorId');
  assert.ok(firstRel.toActorId, 'Relationship should have toActorId');
  assert.ok(firstRel.type, 'Relationship should have type');
  assert.ok(firstRel.status, 'Relationship should have status');
});

test('createActor creates valid actors from JSON data', () => {
  const supplier = createActor(actorsData[0]);
  assert.strictEqual(supplier.type, 'supplier', 'Should create supplier actor');
  assert.ok(Array.isArray(supplier.rawMaterialTypes), 'Supplier should have rawMaterialTypes');
  
  const producer = createActor(actorsData.find(a => a.type === 'producer'));
  assert.strictEqual(producer.type, 'producer', 'Should create producer actor');
  assert.ok(typeof producer.productionCapacity === 'number', 'Producer should have productionCapacity');
});

test('lookup service can query actors by type', () => {
  const actors = new Map();
  actorsData.forEach(data => {
    const actor = createActor(data);
    actors.set(actor.id, actor);
  });
  
  const relationships = new Map();
  const lookup = createLookupService(actors, relationships);
  
  const suppliers = lookup.queryActors({ type: 'supplier' });
  assert.strictEqual(suppliers.length, 2, 'Should find 2 suppliers');
  
  const producers = lookup.queryActors({ type: 'producer' });
  assert.strictEqual(producers.length, 1, 'Should find 1 producer');
});

test('lookup service can query actors by name', () => {
  const actors = new Map();
  actorsData.forEach(data => {
    const actor = createActor(data);
    actors.set(actor.id, actor);
  });
  
  const relationships = new Map();
  const lookup = createLookupService(actors, relationships);
  
  const results = lookup.queryActors({ name: 'Raw' });
  assert.ok(results.length > 0, 'Should find actors with "Raw" in name');
  assert.ok(results[0].name.includes('Raw'), 'Result should contain "Raw"');
});

test('lookup service can query actors by cooperative', () => {
  const actors = new Map();
  actorsData.forEach(data => {
    const actor = createActor(data);
    actors.set(actor.id, actor);
  });
  
  const relationships = new Map();
  const lookup = createLookupService(actors, relationships);
  
  const results = lookup.queryActors({ cooperativeId: 'coop1' });
  assert.strictEqual(results.length, 2, 'Should find 2 cooperative members');
});

test('lookup service can find supply chain paths', () => {
  const actors = new Map();
  actorsData.forEach(data => {
    const actor = createActor(data);
    actors.set(actor.id, actor);
  });
  
  const relationships = new Map();
  relationshipsData.forEach(rel => {
    relationships.set(rel.id, rel);
  });
  
  const lookup = createLookupService(actors, relationships);
  
  const path = lookup.findPath('s1', 'r1');
  assert.ok(Array.isArray(path), 'Should return a path array');
  assert.ok(path.length > 0, 'Path should not be empty');
  assert.strictEqual(path[0], 's1', 'Path should start at s1');
  assert.strictEqual(path[path.length - 1], 'r1', 'Path should end at r1');
  
  // The path should be: s1 -> p1 -> d1 -> r1
  assert.strictEqual(path.length, 4, 'Path should have 4 actors');
});

test('lookup service returns empty path when no path exists', () => {
  const actors = new Map();
  actorsData.forEach(data => {
    const actor = createActor(data);
    actors.set(actor.id, actor);
  });
  
  const relationships = new Map();
  relationshipsData.forEach(rel => {
    relationships.set(rel.id, rel);
  });
  
  const lookup = createLookupService(actors, relationships);
  
  // Try to find path from retailer back to supplier (no reverse relationships)
  const path = lookup.findPath('r1', 's1');
  assert.strictEqual(path.length, 0, 'Should return empty array when no path exists');
});

test('extension data validates supply chain structure', () => {
  // Verify we have a complete supply chain
  const actorTypes = actorsData.map(a => a.type);
  assert.ok(actorTypes.includes('supplier'), 'Should have supplier');
  assert.ok(actorTypes.includes('producer'), 'Should have producer');
  assert.ok(actorTypes.includes('distributor'), 'Should have distributor');
  assert.ok(actorTypes.includes('retailer'), 'Should have retailer');
  
  // Verify relationships connect the actors
  const fromIds = relationshipsData.map(r => r.fromActorId);
  const toIds = relationshipsData.map(r => r.toActorId);
  
  assert.ok(fromIds.includes('s1'), 'Supplier s1 should have outgoing relationships');
  assert.ok(toIds.includes('r1'), 'Retailer r1 should have incoming relationships');
});
