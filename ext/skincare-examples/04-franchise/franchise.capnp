using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "franchise:franchise", esModule = embed "franchise.js" ),
    
    # Internal modules
    ( name = "franchise-internal:impl", esModule = embed "franchise-impl.js", internal = true ),
    ( name = "franchise-internal:lookup", esModule = embed "lookup.js", internal = true ),
    
    # Binding module
    ( name = "franchise:binding", esModule = embed "franchise-binding.js", internal = true ),
  ]
);
