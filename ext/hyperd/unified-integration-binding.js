// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { UnifiedNeuralIntegration } from "hyperd-internal:unified-integration-impl";

function makeBinding(env) {
  // Collect all registered neural network systems
  const systems = {};
  
  if (env.neuralSupplyChain) {
    systems.scm = env.neuralSupplyChain;
  }
  
  if (env.neuralCRM) {
    systems.crm = env.neuralCRM;
  }
  
  if (env.neuralMRP) {
    systems.mrp = env.neuralMRP;
  }
  
  if (env.neuralLMS) {
    systems.lms = env.neuralLMS;
  }

  return new UnifiedNeuralIntegration(systems);
}

export default makeBinding;
