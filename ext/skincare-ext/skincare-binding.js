// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { SkincareBrand } from "skincare-brand-internal:skincare-impl";

function makeSkincareBinding(env) {
  // Combine salons, formulations and procedures from inner bindings
  const data = {
    salons: env.salons || [],
    formulations: env.formulations || [],
    procedures: env.procedures || [],
  };
  
  return new SkincareBrand(data);
}

export default makeSkincareBinding;
