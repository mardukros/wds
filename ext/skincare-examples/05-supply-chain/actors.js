// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Internal actor management - hidden from user code

export function createActorMap(actors) {
  return new Map(actors.map(a => [a.id, a]));
}

export function getActorsByType(actors, type) {
  return actors.filter(a => a.type === type);
}

export function getActorsBySubtype(actors, subtype) {
  return actors.filter(a => a.subtype === subtype);
}

export function findActorsByName(actors, nameFragment) {
  return actors.filter(a => 
    a.name.toLowerCase().includes(nameFragment.toLowerCase())
  );
}

export function findActorsByLocation(actors, city) {
  return actors.filter(a => a.location?.city === city);
}

export function findActorsByCertification(actors, certification) {
  return actors.filter(a => 
    a.certifications?.includes(certification)
  );
}

export function findActorsByProduct(actors, product) {
  return actors.filter(a => 
    a.products?.includes(product) || a.productTypes?.includes(product)
  );
}
