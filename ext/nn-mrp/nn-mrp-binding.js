// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { NeuralMRP } from "nn-mrp-internal:nn-mrp-impl";

function makeBinding(env) {
  const data = {
    materials: env.materials || [],
    demand: env.demand || [],
    embeddingDimension: 128
  };
  return new NeuralMRP(data);
}

export default makeBinding;
