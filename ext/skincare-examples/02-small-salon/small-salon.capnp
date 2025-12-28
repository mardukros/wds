using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module
    ( name = "small-salon:small-salon", esModule = embed "small-salon.js" ),
    
    # Internal modules
    ( name = "small-salon-internal:impl", esModule = embed "small-salon-impl.js", internal = true ),
    
    # Binding module
    ( name = "small-salon:binding", esModule = embed "small-salon-binding.js", internal = true ),
  ]
);
