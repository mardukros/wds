// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { NeuralCRM } from "nn-crm-internal:nn-crm-impl";

function makeBinding(env) {
  const data = {
    customers: env.customers || [],
    interactions: env.interactions || [],
    embeddingDimension: 128
  };
  return new NeuralCRM(data);
}

export default makeBinding;
