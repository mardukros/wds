// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { NeuralLMS } from "nn-lms-internal:nn-lms-impl";

function makeBinding(env) {
  const data = {
    learners: env.learners || [],
    courses: env.courses || [],
    embeddingDimension: 128
  };
  return new NeuralLMS(data);
}

export default makeBinding;
