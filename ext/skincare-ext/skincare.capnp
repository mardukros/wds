using Workerd = import "/workerd/workerd.capnp";

const extension :Workerd.Extension = (
  modules = [
    # Public module that can be imported by users
    ( name = "skincare-brand:skincare", esModule = embed "skincare.js" ),
    
    # Internal modules - can only be imported by other extension modules
    ( name = "skincare-brand-internal:skincare-impl", esModule = embed "skincare-impl.js", internal = true ),
    ( name = "skincare-brand-internal:salon", esModule = embed "salon.js", internal = true ),
    ( name = "skincare-brand-internal:formulations", esModule = embed "formulations.js", internal = true ),
    ( name = "skincare-brand-internal:procedures", esModule = embed "procedures.js", internal = true ),
    
    # Binding module - only internal modules can be used for bindings
    ( name = "skincare-brand:binding", esModule = embed "skincare-binding.js", internal = true ),
  ]
);
