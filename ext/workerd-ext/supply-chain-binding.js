// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { SupplyChain } from "supply-chain-internal:supply-chain-impl";

function makeSupplyChainBinding(env) {
  // Combine actors and relationships from inner bindings
  const data = {
    actors: env.actors || [],
    relationships: env.relationships || [],
  };
  
  return new SupplyChain(data);
}

export default makeSupplyChainBinding;
