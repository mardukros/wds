// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { Mediclinic } from "mediclinic-internal:impl";

function makeBinding(env) {
  const clinicData = env.clinic ? JSON.parse(env.clinic) : [];
  const formulationsData = env.formulations ? JSON.parse(env.formulations) : [];
  const proceduresData = env.procedures ? JSON.parse(env.procedures) : [];

  return new Mediclinic({
    clinic: clinicData[0] || {},
    formulations: formulationsData,
    procedures: proceduresData
  });
}

export default makeBinding;
