using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module that can be imported by users
    ( name = "nn-integration:nn-supply-chain", esModule = embed "nn-supply-chain.js" ),
    
    # Internal modules - can only be imported by other extension modules
    ( name = "nn-integration-internal:nn-supply-chain-impl", esModule = embed "nn-supply-chain-impl.js", internal = true ),
    ( name = "nn-integration-internal:tensor-embeddings", esModule = embed "tensor-embeddings.js", internal = true ),
    ( name = "nn-integration-internal:flow-dynamics", esModule = embed "flow-dynamics.js", internal = true ),
    
    # Binding module - only internal modules can be used for bindings
    ( name = "nn-integration:binding", esModule = embed "nn-supply-chain-binding.js", internal = true ),
  ]
);
