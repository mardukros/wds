using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module that can be imported by users
    ( name = "supply-chain:supply-chain", esModule = embed "supply-chain.js" ),
    
    # Internal modules - can only be imported by other extension modules
    ( name = "supply-chain-internal:supply-chain-impl", esModule = embed "supply-chain-impl.js", internal = true ),
    ( name = "supply-chain-internal:actors", esModule = embed "actors.js", internal = true ),
    ( name = "supply-chain-internal:lookup", esModule = embed "lookup.js", internal = true ),
    
    # Binding module - only internal modules can be used for bindings
    ( name = "supply-chain:binding", esModule = embed "supply-chain-binding.js", internal = true ),
  ]
);
