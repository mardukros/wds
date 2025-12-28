using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    ( name = "nn-mrp:nn-mrp", esModule = embed "nn-mrp.js" ),
    ( name = "nn-mrp-internal:nn-mrp-impl", esModule = embed "nn-mrp-impl.js", internal = true ),
    ( name = "nn-mrp-internal:mrp-embeddings", esModule = embed "mrp-embeddings.js", internal = true ),
    ( name = "nn-mrp-internal:mrp-network", esModule = embed "mrp-network.js", internal = true ),
    ( name = "nn-mrp:binding", esModule = embed "nn-mrp-binding.js", internal = true ),
  ]
);
