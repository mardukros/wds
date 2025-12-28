using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    ( name = "nn-lms:nn-lms", esModule = embed "nn-lms.js" ),
    ( name = "nn-lms-internal:nn-lms-impl", esModule = embed "nn-lms-impl.js", internal = true ),
    ( name = "nn-lms-internal:lms-embeddings", esModule = embed "lms-embeddings.js", internal = true ),
    ( name = "nn-lms-internal:lms-network", esModule = embed "lms-network.js", internal = true ),
    ( name = "nn-lms:binding", esModule = embed "nn-lms-binding.js", internal = true ),
  ]
);
