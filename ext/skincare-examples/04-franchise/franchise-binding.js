// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { Franchise } from "franchise-internal:impl";

function makeBinding(env) {
  const locationsData = env.locations ? JSON.parse(env.locations) : [];
  const formulationsData = env.formulations ? JSON.parse(env.formulations) : [];
  const proceduresData = env.procedures ? JSON.parse(env.procedures) : [];
  const relationshipsData = env.relationships ? JSON.parse(env.relationships) : {};

  return new Franchise({
    locations: locationsData,
    formulations: formulationsData,
    procedures: proceduresData,
    relationships: relationshipsData
  });
}

export default makeBinding;
