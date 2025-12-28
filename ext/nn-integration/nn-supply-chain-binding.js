// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// Binding module for Neural Network Supply Chain
// Creates a configured instance from environment data

import { NeuralSupplyChain } from "nn-integration-internal:nn-supply-chain-impl";

function makeBinding(env) {
  const data = {
    actors: env.actors || [],
    relationships: env.relationships || [],
    embeddingDimension: env.embeddingDimension || 128
  };
  
  return new NeuralSupplyChain(data);
}

export default makeBinding;
