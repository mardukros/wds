using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "supply-chain:supply-chain", esModule = embed "supply-chain.js" ),
    
    # Internal modules
    ( name = "supply-chain-internal:impl", esModule = embed "supply-chain-impl.js", internal = true ),
    ( name = "supply-chain-internal:actors", esModule = embed "actors.js", internal = true ),
    ( name = "supply-chain-internal:lookup", esModule = embed "lookup.js", internal = true ),
    
    # Binding module
    ( name = "supply-chain:binding", esModule = embed "supply-chain-binding.js", internal = true ),
  ]
);
