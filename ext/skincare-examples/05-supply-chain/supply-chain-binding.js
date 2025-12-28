// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { SkincareSupplyChain } from "supply-chain-internal:impl";

function makeBinding(env) {
  const actorsData = env.actors ? JSON.parse(env.actors) : [];
  const relationshipsData = env.relationships ? JSON.parse(env.relationships) : {};

  return new SkincareSupplyChain({
    actors: actorsData,
    relationships: relationshipsData
  });
}

export default makeBinding;
